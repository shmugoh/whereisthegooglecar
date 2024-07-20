import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { ContextType, PAGINATION_TAKE, PotLogger } from "../utils/constants";

// TODO: distribute this context script-wide
import { Redis } from "@upstash/redis/cloudflare";
import { HTTPException } from "hono/http-exception";
import { capitalizeLetter } from "../utils/strings";

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
      const pool = new Pool({ connectionString: c.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      const prisma = new PrismaClient({ adapter });

      // query
      let renamed_data;
      const data = await prisma.spottings.findFirst({
        where: {
          message_id: id,
        },
        select: {
          message_id: true,
          date: true,
          country: true,
          countryEmoji: true,
          town: true,
          company: true,
          sourceUrl: true,
          locationUrl: true,
          imageUrl: true,
          width: true,
          height: true,
        },
      });

      if (!data) {
        throw new HTTPException(404, { message: "Not Found" });
      }

      // pos-query (final changes)
      renamed_data = {
        id: data.message_id,
        date: data.date,
        country: data.country,
        country_emoji: data.countryEmoji,
        town: data.town,
        service: capitalizeLetter(data.company),
        source: data.sourceUrl,
        location: data.locationUrl,
        image: data.imageUrl,
        width: data.width,
        height: data.height,
      };

      // pos-query (store in cache)
      PotLogger("[SPOTTINGS - ID] -", `Caching ${id}...`);
      await redis.hset(`spottings:${id}`, { renamed_data });

      // return
      return renamed_data;
    } catch (e) {
      if (e instanceof HTTPException) {
        throw e;
      }
      throw new HTTPException(500, {
        message: `Internal Server Error: ${JSON.stringify(e)}`,
      });
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
      const cacheKey = `spottings:${service}:${month}:${year}`;

      // grab from cache
      if (cache && ((!town && !country) || !town || !country)) {
        // protect from other entries

        const redis = Redis.fromEnv(c.env);
        PotLogger("[METADATA - MONTHS] -", "Grabbing from REDIS...", cacheKey);
        const cached_month: SpottingsArray | null = await redis.hget(
          cacheKey,
          `${page}`
        );
        if (cached_month) {
          return cached_month;
        }
      }

      // connect to database
      PotLogger("[SPOTTINGS - QUERY] -", `Grabbing from DB...`);
      const pool = new Pool({ connectionString: c.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      const prisma = new PrismaClient({ adapter });

      // Define the date range
      const gteDate = new Date(year, month - 1, 1); // YEAR/MONTH/1
      const lteDate = new Date(year, month, 0); // YEAR/MONTH/31

      // Base WHERE conditions
      const whereConditions: Prisma.spottingsWhereInput = {
        date: {
          gte: gteDate,
          lte: lteDate,
        },
        town: town
          ? { contains: town, mode: Prisma.QueryMode.insensitive }
          : undefined,
        country: country ? { equals: country } : undefined,
        company: service
          ? service === "others_rest"
            ? { notIn: ["google", "apple", "yandex"] }
            : { contains: service, mode: Prisma.QueryMode.insensitive }
          : undefined,
      };

      // Calculate pagination
      const PAGINATION_SKIP = PAGINATION_TAKE * page;

      // Query
      const data = await prisma.spottings.findMany({
        where: whereConditions,
        select: {
          message_id: true,
          date: true,
          country: true,
          countryEmoji: true,
          company: true,
          town: true,
          sourceUrl: true,
          locationUrl: true,
          imageUrl: true,
          width: true,
          height: true,
        },
        orderBy: [{ date: "desc" }, { id: "asc" }],
        take: PAGINATION_TAKE,
        skip: PAGINATION_SKIP,
      });

      // Rename fields in the result
      const renamedData = data.map((item) => ({
        id: item.message_id,
        date: item.date,
        country: item.country,
        country_emoji: item.countryEmoji,
        service: capitalizeLetter(item.company),
        town: item.town,
        source: item.sourceUrl,
        location: item.locationUrl,
        image: item.imageUrl,
        width: item.width,
        height: item.height,
      }));

      if (data.length == 0) {
        throw new HTTPException(404, { message: "Not Found" });
      }

      if (cache && ((!town && !country) || !town || !country)) {
        // protect from other entries

        const redis = Redis.fromEnv(c.env);
        PotLogger("[SPOTTINGS - QUERY] -", `Caching...`);
        await redis.hset(cacheKey, { [page]: renamedData });
      }

      return renamedData;
    } catch (e) {
      if (e instanceof HTTPException) {
        throw e;
      }
      throw new HTTPException(500, {
        message: `Internal Server Error: ${JSON.stringify(e)}`,
      });
    }
  }
}

export const spottingsController = new SpottingsController();
