import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { asc, desc, gte, lte } from "drizzle-orm";
import { spottings as spottings_schema } from "../db/schema";

import { buildCountryObject, capitalizeLetter } from "../utils/strings";
import { orderServices } from "../utils/arrays";
import { OTHERS_EMOJI, PAGINATION_TAKE } from "../utils/constants";

class MetadataController {
  async getServices(c: any) {
    try {
      // connect to database
      const sql = postgres(c.env.DATABASE_URL);
      const db = drizzle(sql);

      // query
      const queryResult = await db
        .selectDistinct({ services: spottings_schema.company })
        .from(spottings_schema);

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
          country_value: spottings_schema.country,
          country_emoji: spottings_schema.countryEmoji,
        })
        .from(spottings_schema)
        .orderBy(asc(spottings_schema.country));

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
        .selectDistinct({ date: spottings_schema.date })
        .from(spottings_schema)
        .orderBy(asc(spottings_schema.date))
        .limit(1);
      const newestDateResult = await db
        .selectDistinct({ date: spottings_schema.date })
        .from(spottings_schema)
        .orderBy(desc(spottings_schema.date))
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

  // TODO: Grab the following parameters:
  // from: to:
  // company
  // country, town
  // cache (boolean)
  async getAvailableMonths(c: any) {
    try {
      // connect to database
      const sql = postgres(c.env.DATABASE_URL);
      const db = drizzle(sql);

      // TODO: whereclause builder

      // query
      const queryResult = await db
        .select({ date: spottings_schema.date })
        .from(spottings_schema)
        .where(lte(spottings_schema.date, new Date()));

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

      return dataWithCounts;
    } catch (error) {
      return error;
    }
  }
}

export const metadataController = new MetadataController();
