import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { SQL, and, asc, desc, gte, ilike, like, lte } from "drizzle-orm";
import { spottings } from "../db/schema";

import { buildCountryObject, capitalizeLetter } from "../utils/strings";
import { orderServices } from "../utils/arrays";
import { OTHERS_EMOJI, PAGINATION_TAKE } from "../utils/constants";

// TODO: distribute this context script-wide
import { Context } from "hono";
import { Env } from "../routes/spottings";
type C = Context<{ Bindings: Env }>;

class MetadataController {
  async getServices(c: any) {
    try {
      // connect to database
      const sql = postgres(c.env.DATABASE_URL);
      const db = drizzle(sql);

      // query
      const queryResult = await db
        .selectDistinct({ services: spottings.company })
        .from(spottings);

      // post-query
      let result: string[] = [];
      queryResult.forEach((field) => {
        let serviceName = capitalizeLetter(field.services);
        result.push(serviceName);
      });
      orderServices(result);

      // return
      return result;
    } catch (error) {
      return error;
    }
  }

  async getCountries(c: any) {
    try {
      // connect to db
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

      let result: { label: string; value: any }[] = [];
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
          result.push(buff);
        }
      });

      // return
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async getDateSpan(c: any) {
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
      return error;
    }
  }

  async getAvailableMonths(
    c: C,
    service: string,
    country: string,
    town: string,
    cache: Boolean
  ) {
    try {
      // cache
      // FORMAT: MONTHS:SERVICE
      if (cache && country == undefined && town == undefined) {
        const cached_months = await c.env.KV.get(`months:${service}`, "json");
        if (cached_months) {
          console.log("CACHE FOUND");
          return cached_months;
        }
      } else {
        console.log("NO CACHE... GRABBING FROM DB...");
      }

      // connect to database
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
        .where(and(...sqlConditions));

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
      const dataWithCounts = uniqueDates.map((uniqueDate) => {
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
      if (cache && country == undefined && town == undefined) {
        console.log("CACHING...");
        await c.env.KV.put(`months:${service}`, JSON.stringify(dataWithCounts));
      }

      return dataWithCounts;
    } catch (error) {
      return error;
    }
  }
}

export const metadataController = new MetadataController();
