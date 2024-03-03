import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { kv } from "@vercel/kv";

export const queryRouter = createTRPCRouter({
  queryByFilter: publicProcedure
    .input(
      z.object({
        company: z.string().toLowerCase(),
        month: z.string(),
        year: z.string(),
      }),
    )
    .mutation(({ input, ctx }) => {
      const { company, month, year } = input;

      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(`${year}-${month}-31`);

      const data = ctx.db.spottings
        .findMany({
          where: {
            company: company,
            date: { gte: startDate, lte: endDate },
          },
          orderBy: { date: "desc" },
        })
        .then((data) => {
          if (data.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `No data found for ${month}/${year}`,
            });
          } else {
            return data;
          }
        });

      return data;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // obtains from cache
      let cachedValue = await kv.hget(
        `spotting:${input.id.toString()}`,
        "data",
      );
      if (cachedValue) {
        console.log(`[CACHE] Loading ${input.id} from cache...`);
        return cachedValue;
      }

      // obtains from database if cache is empty
      const data = await ctx.db.spottings
        .findUnique({
          where: { id: input.id },
        })
        .then((data) => {
          if (data) {
            return data;
          } else {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `No data found for ID ${input.id}`,
            });
          }
        });

      // kv automatically stringifies the object,
      // thus causing serialization errors
      // the below values are "not serializable"
      // (date && bigint)
      const date = data.date.toISOString();
      const createdAt = data.createdAt.toISOString();
      const updatedAt = data.updatedAt.toISOString();
      const message_id = String(data.message_id);
      const channel_id = String(data.channel_id);

      // registers to cache
      console.log(`[CACHE] Caching ${input.id}...`);
      await kv.hset(`spotting:${input.id.toString()}`, {
        data: {
          ...data,
          date: date,
          createdAt: createdAt,
          updatedAt: updatedAt,
          message_id: message_id,
          channel_id: channel_id,
        },
      });

      // load from new cache
      console.log(`[CACHE] Loading ${input.id} from cache...`);
      cachedValue = await kv.hget(`spotting:${input.id.toString()}`, "data");
      return cachedValue;
    }),
});
