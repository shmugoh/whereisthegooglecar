import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { asc, desc, gte, lte, eq, ilike, and, like, SQL } from "drizzle-orm";
import { spottings } from "../db/schema";
import { ContextType, PAGINATION_TAKE, PotLogger } from "../utils/constants";

// TODO: distribute this context script-wide
import { Redis } from "@upstash/redis/cloudflare";
import { HTTPException } from "hono/http-exception";
import { buildRedisKey } from "../utils/strings";

class SpottingsController {
  async getById(c: ContextType, id: string): Promise<SpottingMetadata> {
    try {
      // check if in cache
      PotLogger("[SPOTTINGS - ID] -", `Grabbing spottings:${id} from cache...`);
      const redis = Redis.fromEnv(c.env);
      const id_cache: SpottingsID | null = await redis.hget(
        `spottings:${id}`,
        "data"
      );
      if (id_cache) {
        PotLogger("[SPOTTINGS - ID] -", `Found in cache.`, `Returning...`);
        return id_cache[0];
      }

      // if not in cache, then grab from database
      // connect to database
      PotLogger("[SPOTTINGS - ID] -", `No cache found.`, `Grabbing from DB...`);
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

      if (data.length == 0) {
        throw new HTTPException(404, { message: "Not Found" });
      }

      // pos-query (store in cache)
      PotLogger("[SPOTTINGS - ID] -", `Caching ${id}...`);
      await redis.hset(`spottings:${id}`, { data });

      // return
      return data[0];
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Internal Server Error" });
    }
  }

  async getByQuery(
    c: ContextType,
    country: string,
    town: string,
    service: string,
    month: number,
    year: number,
    page: number,
    cache: boolean
  ): Promise<SpottingsArray> {
    try {
      // grab from cache
      const redis = Redis.fromEnv(c.env);
      const cacheKey = buildRedisKey(
        `${service}:${month}:${year}`,
        country,
        town
      );
      PotLogger("[METADATA - MONTHS] -", "Grabbing from REDIS...", cacheKey);
      const cached_month: SpottingsArray | null = await redis.hget(
        cacheKey,
        `${page}`
      );
      if (cached_month) {
        return cached_month;
      }

      // connect to database
      PotLogger("[SPOTTINGS - QUERY] -", `Grabbing from DB...`);
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

      if (data.length == 0) {
        throw new HTTPException(404, { message: "Not Found" });
      }

      PotLogger("[SPOTTINGS - QUERY] -", `Caching...`);
      await redis.hset(cacheKey, { [page]: data });

      return data;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Internal Server Error" });
    }
  }
}

export const spottingsController = new SpottingsController();
