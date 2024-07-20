import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { buildCountryObject, capitalizeLetter } from "../utils/strings";
import { orderServices } from "../utils/arrays";
import {
  ContextType,
  OTHERS_EMOJI,
  PAGINATION_TAKE,
  PotLogger,
} from "../utils/constants";

// TODO: distribute this context script-wide
import { Redis } from "@upstash/redis/cloudflare";
import { HTTPException } from "hono/http-exception";

class MetadataController {
  async getServices(c: ContextType): Promise<ServicesList> {
    try {
      // grab from cache
      PotLogger("[METADATA - SERVICES] -", "Grabbing from REDIS...");
      const redis = Redis.fromEnv(c.env);
      const cached_services: ServicesList | null = await redis.lrange(
        "services",
        0,
        -1
      );
      if (cached_services.length != 0) {
        return cached_services;
      }

      // connect to database
      PotLogger("[METADATA - SERVICES] -", "Grabbing from DB...");
      const pool = new Pool({ connectionString: c.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      const prisma = new PrismaClient({ adapter });

      // query
      const queryResult = await prisma.spottings.findMany({
        distinct: ["company"],
        select: {
          company: true,
        },
      });

      // post-query
      let result: ServicesList = [];
      queryResult.forEach((field) => {
        let serviceName = capitalizeLetter(field.company);
        result.push({ label: serviceName, value: field.company });
      });
      result = orderServices(result);

      // cache to redis

      // doing this in reverse, as `...result`
      // pushes it from start to finish from the first index
      PotLogger("[METADATA - SERVICES] -", "Caching to REDIS...");
      await redis.rpush("services", ...result);

      // return
      return result;
    } catch (error) {
      PotLogger("[METADATA - SERVICES] -", `ERROR: `, `${error}`);
      throw new HTTPException(500, { message: "Internal Server Error" });
    }
  }

  async getCountries(c: ContextType): Promise<CountriesList> {
    try {
      // grab from cache
      PotLogger("[METADATA - COUNTRIES] -", "Grabbing from REDIS...");
      const redis = Redis.fromEnv(c.env);

      const available_countries: CountriesList | null = await redis.hget(
        "countries",
        "data"
      );
      if (available_countries) {
        return available_countries;
      }

      // connect to db
      PotLogger("[METADATA - COUNTRIES] -", "Grabbing from DB...");
      const pool = new Pool({ connectionString: c.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      const prisma = new PrismaClient({ adapter });

      // query
      const queryResult = await prisma.spottings.findMany({
        distinct: ["country"],
        select: {
          country: true,
          countryEmoji: true,
        },
        orderBy: {
          country: "asc",
        },
      });

      // post-query
      const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

      let data: { label: string; value: any }[] = [];
      queryResult.forEach((field) => {
        let buff: CountryMetadata = { label: "", value: "" };

        if (field.country == "others") {
          // build object for countries that are marked as others
          buff = buildCountryObject("others", OTHERS_EMOJI, "Others");
        } else {
          // build object for specific countries
          const country_name = regionNames.of(field.country);
          if (country_name) {
            buff = buildCountryObject(
              field.country,
              field.countryEmoji,
              country_name
            );
          }
        }

        // push to output
        if (buff) {
          data.push(buff);
        }
      });

      // cache to redis
      PotLogger("[METADATA - COUNTRIES] -", "Caching to REDIS...");
      await redis.hset("countries", { data });

      // return
      return data;
    } catch (error) {
      PotLogger("[METADATA - COUNTRIES] -", `ERROR: `, `${error}`);
      throw new HTTPException(500, { message: "Internal Server Error" });
    }
  }

  async getDateSpan(c: ContextType): Promise<DateSpanResult> {
    try {
      // connect to database
      const pool = new Pool({ connectionString: c.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      const prisma = new PrismaClient({ adapter });

      // query
      const earliestDateResult = await prisma.spottings.findMany({
        distinct: ["date"],
        select: {
          date: true,
        },
        orderBy: {
          date: "asc",
        },
        take: 1,
      });
      const newestDateResult = await prisma.spottings.findMany({
        distinct: ["date"],
        select: {
          date: true,
        },
        orderBy: {
          date: "desc",
        },
        take: 1,
      });

      // post-query
      let result: DateSpanResult = {
        earliest_date: earliestDateResult[0].date,
        newest_date: newestDateResult[0].date,
      };

      // return
      return result;
    } catch (error) {
      throw new HTTPException(500, { message: "Internal Server Error" });
    }
  }

  async getAvailableMonths(
    c: ContextType,
    service: string,
    country: string,
    town: string,
    cache: Boolean
  ): Promise<MonthList> {
    try {
      const cacheKey = `months:${service}`;

      // grab from cache
      const redis = Redis.fromEnv(c.env);
      if (cache && ((!town && !country) || !town || !country)) {
        // protect from other entries

        PotLogger("[METADATA - MONTHS] -", "Grabbing from REDIS...", cacheKey);
        const cached_months: MonthList | null = await redis.hget(
          cacheKey,
          "data"
        );
        if (cached_months) {
          return cached_months;
        }
      }

      // connect to database
      PotLogger("[METADATA - MONTHS] -", "Grabbing from DB...", cacheKey);
      const pool = new Pool({ connectionString: c.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      const prisma = new PrismaClient({ adapter });

      const sqlConditions: Prisma.spottingsWhereInput = {
        date: {
          lte: new Date(),
        },
        company: service
          ? { contains: service, mode: Prisma.QueryMode.insensitive }
          : undefined,
        country: country ? { equals: country } : undefined,
        town: town
          ? { contains: town, mode: Prisma.QueryMode.insensitive }
          : undefined,
      };
      const queryResult = await prisma.spottings.findMany({
        select: {
          date: true,
        },
        where: sqlConditions,
        orderBy: {
          date: "desc",
        },
      });

      if (queryResult.length == 0) {
        throw new HTTPException(404, { message: "Not Found" });
      }

      // post-query
      const uniqueDates = queryResult
        // get month & year from all dates
        .map((item) => {
          return new Date(
            item.date.getUTCFullYear(),
            item.date.getUTCMonth(),
            1
          );
        })
        // remove duplicates
        .filter((value, index, self) => {
          return (
            self.findIndex((d) => d.getTime() === value.getTime()) === index
          );
        });

      // grab count
      const data = uniqueDates.map((uniqueDate) => {
        // filter data for specific month
        const filteredData = queryResult.filter((item) => {
          const date = new Date(
            item.date.getUTCFullYear(),
            item.date.getUTCMonth(),
            1
          );
          return date.getTime() === uniqueDate.getTime();
        });

        // calculate count
        const division = filteredData.length / PAGINATION_TAKE;
        const count = division <= 1 ? 0 : Math.floor(division);

        // return unique data with its count counterpart
        return {
          date: uniqueDate,
          pages: count,
          count: filteredData.length,
        };
      });

      // cache
      // FORMAT: MONTHS: SERVICE;
      if (cache && ((!town && !country) || !town || !country)) {
        // protect from other entries

        PotLogger("[METADATA - MONTHS] -", `Caching...`);
        await redis.hset(cacheKey, { data });
      }

      return data;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Internal Server Error" });
    }
  }
}

export const metadataController = new MetadataController();
