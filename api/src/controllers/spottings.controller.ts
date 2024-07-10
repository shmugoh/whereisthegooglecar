import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { asc, desc, gte, lte, eq } from "drizzle-orm";
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
}

export const spottingsController = new SpottingsController();
