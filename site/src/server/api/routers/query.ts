/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { kv } from "@vercel/kv";

const PAGE_TAKE = 9;

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

export const queryRouter = createTRPCRouter({
  // grab available months
  queryByFilterMonth: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),

        company: z.string().toLowerCase().optional(),
        country: z.string().toUpperCase().optional(),

        town: z.string().optional(),

        cache: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { company, startDate, endDate, town, country } = input;

      // obtains from cache
      if (input.cache) {
        // build month
        const cachedValue: Array<{ date: Date; pages: number; count: number }> =
          (await kv.hget(`spottings:${company}`, "months")) ?? [];
        if (cachedValue.length !== 0) {
          console.log(
            `[CACHE - MONTHS] Loading spottings:${company}:months from cache...`,
          );
          cachedValue.forEach((element) => {
            element.date = new Date(element.date);
          });
          return cachedValue;
        }
      }

      // obtain from database
      console.log(
        `[DB - MONTHS] Loading spottings:${company}:months from DB...`,
      );

      // write where clause
      const whereClause: any = {};
      // company
      if (company) {
        whereClause.company =
          company === "others_rest"
            ? { notIn: ["google", "apple", "yandex"] }
            : company;
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
        whereClause.country = country === "OTHERS" ? "others" : country;
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

            // grab count
            const dataWithCounts = uniqueDates.map((uniqueDate) => {
              // filter data for specific month
              const filteredData = data.filter((item) => {
                const date = new Date(
                  item.date.getUTCFullYear(),
                  item.date.getUTCMonth(),
                  1,
                );
                return date.getTime() === uniqueDate.getTime();
              });

              // calculate count
              const division = filteredData.length / PAGE_TAKE;
              const count = division <= 1 ? 0 : Math.floor(division);

              // return unique data with its count counterpart
              return {
                date: uniqueDate,
                pages: count,
                count: filteredData.length,
              };
            });

            return dataWithCounts;
          }
        });

      // store to cache
      if (input.cache) {
        console.log(`[CACHE - MONTHS] Caching spottings:${company}:months...`);
        await kv.hset(`spottings:${company}`, { months: data });
      }

      // load from database
      return data;
    }),

  // query by month
  queryByMonth: publicProcedure
    .input(
      z.object({
        month: z.number(),
        year: z.number(),

        company: z.string().toLowerCase(),
        town: z.string().optional(),
        country: z.string().toUpperCase().optional(),

        page: z.number().default(0),
        cache: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { company, month, year, page } = input;
      const PAGE_SKIP = input.page * PAGE_TAKE;

      // obtains from cache
      if (input.cache) {
        const cachedValue = await kv.hget(
          `spottings:${company}:${month}:${year}`,
          `${page}`,
        );
        if (cachedValue) {
          console.log(
            `[CACHE - queryByMonth] Loading spottings:${company}:${month}:${year}:${page} from cache...`,
          );
          return cachedValue;
        }
      }

      // loads from database if cache is empty
      console.log(
        `[DB - queryByMonth] Loading spottings:${company}:${month}:${year}:${page} from DB...`,
      );

      // build where clause
      const whereClause: queryClause = {};
      if (typeof month !== "undefined" && typeof year !== "undefined") {
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0));

        whereClause.date = { gte: startDate, lte: endDate };
      }

      if (input.company) {
        input.company === "others_rest"
          ? { notIn: ["google", "apple", "yandex"] }
          : (whereClause.company = company);
      }

      /// search queries
      if (input.town !== undefined) {
        whereClause.town = {
          contains: input.town,
          mode: "insensitive",
        };
      }
      if (input.country !== undefined) {
        whereClause.country === "OTHERS" ? "others" : input.country;
      }

      // perform search to database
      const data = await ctx.db.spottings
        .findMany({
          where: whereClause,
          orderBy: [{ date: "desc" }, { id: "asc" }],
          take: PAGE_TAKE,
          skip: PAGE_SKIP,
        })
        .then((data) => {
          if (data.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `No data found for ${company} in ${month}/${year}:${page}`,
            });
          } else {
            return data;
          }
        });

      // registers to cache
      if (input.cache) {
        console.log(
          `[CACHE - queryByMonth] Caching spottings:${company}:${month}:${year}:${page}...`,
        );
        await kv.hset(`spottings:${company}:${month}:${year}`, {
          [page]: data,
        });
      }

      // load from database
      return data;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // obtains from cache
      const cachedValue = await kv.hget(
        `spotting:${input.id.toString()}`,
        "data",
      );
      if (cachedValue) {
        console.log(`[CACHE - getById] Loading ${input.id} from cache...`);
        return cachedValue;
      }

      // obtains from database if cache is empty
      console.log(`[DB - getById] Loading spottings:${input.id} from DB...`);
      const data = await ctx.db.spottings
        .findFirst({
          where: { message_id: input.id },
        })
        .then((data) => {
          if (data) {
            return {
              ...data,
              date: data.date.toISOString(),
              createdAt: data.createdAt.toISOString(),
              updatedAt: data.updatedAt.toISOString(),
              channel_id: data.channel_id.toString(),
              message_id: data.message_id.toString(),
            };
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

      // load from database
      return data;
    }),
});
