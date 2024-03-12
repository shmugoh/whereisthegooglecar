/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { kv } from "@vercel/kv";

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

export const queryRouter = createTRPCRouter({
  queryByFilterMonth: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),

        company: z.string().toLowerCase().optional(),
        country: z.string().toUpperCase().optional(),

        town: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { company, startDate, endDate, town, country } = input;

      // write where clause
      const whereClause: any = {};
      // company
      if (company) {
        whereClause.company = company;
      }
      // dates - ignore timezones
      if (startDate && endDate) {
        const newStartDate = new Date(
          startDate.getTime() - startDate.getTimezoneOffset() * 60000,
        );
        const newEndDate = new Date(
          endDate.getTime() - endDate.getTimezoneOffset() * 60000,
        );
        whereClause.date = { gte: newStartDate, lte: newEndDate };
      }
      // town - ensure its case insensitive
      if (town) {
        whereClause.town = {
          contains: town,
          mode: "insensitive",
        };
      }
      // country
      if (country) {
        whereClause.country = country;
      }

      const data = await ctx.db.spottings
        .findMany({
          where: whereClause,
          orderBy: { date: "desc" },
          select: { date: true },
        })
        .then((data) => {
          if (data.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `No data found`,
            });
          } else {
            const uniqueDates = data
              // get month & year from all dates
              .map((item) => {
                // const date = new Date(
                //   item.date.getTime() - item.date.getTimezoneOffset() * 60000,
                // );
                return new Date(
                  item.date.getUTCFullYear(),
                  item.date.getUTCMonth(),
                  1,
                );
              })
              // remove duplicates
              .filter((value, index, self) => {
                return (
                  self.findIndex((d) => d.getTime() === value.getTime()) ===
                  index
                );
              });
            return uniqueDates;
          }
        });

      return data;
    }),

  queryByFilter: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),

        company: z.string().toLowerCase().optional(),
        country: z.string().toUpperCase().optional(),

        town: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { company, startDate, endDate, town, country } = input;

      const whereClause: any = {};

      if (company) {
        whereClause.company = company;
      }

      if (startDate && endDate) {
        // set hours to 0 to ignore timezones on backend
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const newStartDate = new Date(
          startDate.getTime() - startDate.getTimezoneOffset() * 60000,
        );
        const newEndDate = new Date(
          endDate.getTime() - endDate.getTimezoneOffset() * 60000,
        );
        whereClause.date = { gte: newStartDate, lte: newEndDate };
      }

      if (town) {
        whereClause.town = {
          contains: town,
          mode: "insensitive",
        };
      }

      if (country) {
        whereClause.country = country;
      }

      const data = await ctx.db.spottings
        .findMany({
          where: whereClause,
          orderBy: { date: "desc" },
        })
        .then((data) => {
          if (data.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `No data found`,
            });
          } else {
            return data;
          }
        });

      return data;
    }),

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
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
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
