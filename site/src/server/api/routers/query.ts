import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { kv } from "@vercel/kv";

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

export const queryRouter = createTRPCRouter({
  queryByMonth: publicProcedure
    .input(
      z.object({
        company: z.string().toLowerCase(),
        month: z.string(),
        year: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { company, month, year } = input;

      // obtains from cache
      let cachedValue = await kv.hget(
        `spottings:${company}:${month}:${year}`,
        "data",
      );
      if (cachedValue) {
        console.log(
          `[CACHE - queryByMonth] Loading spottings:${company}:${month}:${year} from cache...`,
        );
        return cachedValue;
      }

      // loads from database if cache is empty
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(`${year}-${month}-31`);
      const data = await ctx.db.spottings
        .findMany({
          where: {
            company: company === "others" ? { not: "google" } : company,
            date: { gte: startDate, lte: endDate },
          },
          orderBy: { date: "desc" },
        })
        .then((data) => {
          if (data.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `No data found for ${company} in ${month}/${year}`,
            });
          } else {
            return data;
          }
        });

      // // registers to cache
      console.log(
        `[CACHE - queryByMonth] Caching spottings:${company}:${month}:${year}...`,
      );
      await kv.hset(`spottings:${company}:${month}:${year}`, {
        data: data,
      });

      // load from new cache
      console.log(
        `[CACHE - queryByMonth] Loading spottings:${company}:${month}:${year} from cache...`,
      );
      cachedValue = await kv.hget(
        `spottings:${company}:${month}:${year}`,
        "data",
      );
      return cachedValue;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // obtains from cache
      let cachedValue = await kv.hget(
        `spotting:${input.id.toString()}`,
        "data",
      );
      if (cachedValue) {
        console.log(`[CACHE - getById] Loading ${input.id} from cache...`);
        return cachedValue;
      }

      // obtains from database if cache is empty
      const data = await ctx.db.spottings
        .findFirst({
          where: { message_id: input.id },
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

      // registers to cache
      console.log(`[CACHE - getById] Caching ${input.id}...`);
      await kv.hset(`spotting:${input.id.toString()}`, {
        data,
      });

      // load from new cache
      console.log(`[CACHE - getById] Loading ${input.id} from cache...`);
      cachedValue = await kv.hget(`spotting:${input.id.toString()}`, "data");
      return cachedValue;
    }),
});
