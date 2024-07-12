import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { asc, desc, gte, lte, eq, ilike, and, like, SQL } from "drizzle-orm";
import { spottings } from "../db/schema";

class SpottingsController {
  async getById(c: any, id: string) {
    try {
      // connect to database
      const sql = postgres(c.env.DATABASE_URL);
      const db = drizzle(sql);

      // query
      const queryResult = await db
        .select({
          id: spottings.message_id,
          date: spottings.date,
          country: spottings.country,
          country_emoji: spottings.countryEmoji,
          service: spottings.company,
          source: spottings.sourceUrl,
          location: spottings.locationUrl,
          image: spottings.imageUrl,
          width: spottings.width,
          height: spottings.height,
        })
        .from(spottings)
        .where(eq(spottings.message_id, id));

      // return
      console.log(id);
      console.log(queryResult);
      return queryResult;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async getByQuery(
    c: any,
    town: string,
    service: string,
    month: number,
    year: number,
    cache: boolean
  ) {
    try {
      // connect to database
      const sql = postgres(c.env.DATABASE_URL);
      const db = drizzle(sql);

      // pre-query (organize dates)
      const gteDate = new Date(year, month - 1, 1); // YEAR/MONTH/1
      const lteDate = new Date(year, month, 0); // YEAR/MONTH/31

      // base WHERE conditions
      const sqlConditions: SQL<unknown>[] = [
        gte(spottings.date, gteDate),
        lte(spottings.date, lteDate),
        ilike(spottings.town, town ? `%${town}%` : "%%"),
      ];

      // add service condition if provided
      if (service) {
        sqlConditions.push(ilike(spottings.company, `%${service}%`));
      }

      // query
      const queryResult = await db
        .select({
          id: spottings.message_id,
          date: spottings.date,
          country: spottings.country,
          country_emoji: spottings.countryEmoji,
          service: spottings.company,
          town: spottings.town,
          source: spottings.sourceUrl,
          location: spottings.locationUrl,
          image: spottings.imageUrl,
          width: spottings.width,
          height: spottings.height,
        })
        .from(spottings)
        .orderBy(desc(spottings.date), asc(spottings.createdAt))
        .where(and(...sqlConditions));

      return queryResult;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}

export const spottingsController = new SpottingsController();
