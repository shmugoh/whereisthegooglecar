import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { asc, desc, gte, lte, eq, ilike, and, like, SQL } from "drizzle-orm";
import { spottings } from "../db/schema";
import { PAGINATION_TAKE } from "../utils/constants";

// TODO: distribute this context script-wide
import { Context } from "hono";
import { Env } from "../routes/spottings";
import { Redis } from "@upstash/redis/cloudflare";
type C = Context<{ Bindings: Env }>;

class SpottingsController {
  async getById(c: C, id: string) {
    try {
      // check if in cache
      const redis = Redis.fromEnv(c.env);
      const id_cache = await redis.hget(`spottings:${id}`, "data");
      if (id_cache) {
        console.log("CACHE... RETURNING FROM CACHE");
        return id_cache;
      }

      // if not in cache, then grab from database
      // connect to database
      console.log("NO CACHE... GRABBING FROM DB...");
      const sql = postgres(c.env.DATABASE_URL);
      const db = drizzle(sql);

      // query
      const data = await db
        .select({
          id: spottings.message_id,
          date: spottings.date,
          country: spottings.country,
          country_emoji: spottings.countryEmoji,
          town: spottings.town,
          service: spottings.company,
          source: spottings.sourceUrl,
          location: spottings.locationUrl,
          image: spottings.imageUrl,
          width: spottings.width,
          height: spottings.height,
        })
        .from(spottings)
        .where(eq(spottings.message_id, id));

      // pos-query (store in cache)
      console.log("CACHING...");
      await redis.hset(`spottings:${id}`, { data });

      // return
      return data;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async getByQuery(
    c: C,
    country: string,
    town: string,
    service: string,
    month: number,
    year: number,
    page: number,
    cache: boolean
  ) {
    try {
      // cache
      const redis = Redis.fromEnv(c.env);

      // FORMAT: SERVICE:MONTH:YEAR:PAGE
      if (cache && town == undefined) {
        console.log("Finding from CACHE...");
        const cached_month = await redis.hget(
          `${service}:${month}:${year}:${page}`,
          "data"
        );
        if (cached_month) {
          console.log("CACHE... RETURNING FROM CACHE");
          return cached_month;
        }
      }

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

      // add additional conditions if provided
      if (country) {
        sqlConditions.push(like(spottings.country, country));
      }
      if (service) {
        sqlConditions.push(ilike(spottings.company, `%${service}%`));
      }

      // calculate pagination
      const PAGINATION_SKIP = PAGINATION_TAKE * page;

      // query
      const data = await db
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
        .orderBy(desc(spottings.date), asc(spottings.id))
        .where(and(...sqlConditions))
        .limit(PAGINATION_TAKE)
        .offset(PAGINATION_SKIP);

      if (cache && town == undefined) {
        console.log("CACHING...");
        await redis.hset(`${service}:${month}:${year}:${page}`, { data });
      }

      return data;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}

export const spottingsController = new SpottingsController();
