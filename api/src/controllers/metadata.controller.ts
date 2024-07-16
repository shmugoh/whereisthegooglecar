import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { SQL, and, asc, desc, gte, ilike, like, lte } from "drizzle-orm";
import { spottings } from "../db/schema";

import {
  buildCountryObject,
  buildRedisKey,
  capitalizeLetter,
} from "../utils/strings";
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
  async getServices(c: ContextType) {
    try {
      // grab from cache
      PotLogger("[METADATA - SERVICES] -", "Grabbing from REDIS...");
      const redis = Redis.fromEnv(c.env);
      const cached_services = await redis.lrange("services", 0, -1);
      if (cached_services.length != 0) {
        return cached_services;
      }

      // connect to database
      PotLogger("[METADATA - SERVICES] -", "Grabbing from DB...");
      const sql = postgres(c.env.DATABASE_URL);
      const db = drizzle(sql);

      // query
      const queryResult = await db
        .selectDistinct({ services: spottings.company })
        .from(spottings);

      // post-query
      let result: { label: string; value: any }[] = [];
      queryResult.forEach((field) => {
        let serviceName = capitalizeLetter(field.services);
        result.push({ label: serviceName, value: field.services });
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

  async getCountries(c: ContextType) {
    try {
      // grab from cache
      PotLogger("[METADATA - COUNTRIES] -", "Grabbing from REDIS...");
      const redis = Redis.fromEnv(c.env);

      const available_countries = await redis.hget("countries", "data");
      if (available_countries) {
        return available_countries;
      }

      // connect to db
      PotLogger("[METADATA - COUNTRIES] -", "Grabbing from DB...");
      const sql = postgres(c.env.DATABASE_URL);
      const db = drizzle(sql);

      // query
      const queryResult = await db
        .selectDistinct({
          country_value: spottings.country,
          country_emoji: spottings.countryEmoji,
        })
        .from(spottings)
        .orderBy(asc(spottings.country));

      // post-query
      const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

      let data: { label: string; value: any }[] = [];
      queryResult.forEach((field) => {
        let buff: { label: string; value: string } = { label: "", value: "" };

        if (field.country_value == "others") {
          // build object for countries that are marked as others
          buff = buildCountryObject("others", OTHERS_EMOJI, "Others");
        } else {
          // build object for specific countries
          const country_name = regionNames.of(field.country_value);
          if (country_name) {
            buff = buildCountryObject(
              field.country_value,
              field.country_emoji,
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

  async getDateSpan(c: ContextType) {
    try {
      // connect to database
      const sql = postgres(c.env.DATABASE_URL);
      const db = drizzle(sql);

      // query
      const earliestDateResult = await db
        .selectDistinct({ date: spottings.date })
        .from(spottings)
        .orderBy(asc(spottings.date))
        .limit(1);
      const newestDateResult = await db
        .selectDistinct({ date: spottings.date })
        .from(spottings)
        .orderBy(desc(spottings.date))
        .limit(1);

      // post-query
      let result: { earliest_date: Date; newest_date: Date } = {
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
  ) {
    try {
      // grab from cache
      const redis = Redis.fromEnv(c.env);
      const cacheKey = buildRedisKey(`months:${service}`, country, town);
      PotLogger("[METADATA - MONTHS] -", "Grabbing from REDIS...", cacheKey);

      const cached_months = await redis.hget(cacheKey, "data");
      if (cached_months) {
        return cached_months;
      }

      // connect to database
      PotLogger("[METADATA - MONTHS] -", "Grabbing from DB...", cacheKey);
      const sql = postgres(c.env.DATABASE_URL);
      const db = drizzle(sql);

      const sqlConditions: SQL<unknown>[] = [lte(spottings.date, new Date())];
      // add additional conditions if provided
      if (service) {
        sqlConditions.push(ilike(spottings.company, `%${service}%`));
      }
      if (country) {
        sqlConditions.push(like(spottings.country, country));
      }
      if (town) {
        sqlConditions.push(ilike(spottings.town, town ? `%${town}%` : "%%"));
      }

      // query
      const queryResult = await db
        .select({ date: spottings.date })
        .from(spottings)
        .where(and(...sqlConditions))
        .orderBy(desc(spottings.date));

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
      // FORMAT: MONTHS:SERVICE
      PotLogger("[METADATA - MONTHS] -", `Caching...`);
      await redis.hset(cacheKey, { data });

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
