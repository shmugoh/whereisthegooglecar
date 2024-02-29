import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
    .query(({ ctx, input }) => {
      const data = ctx.db.spottings
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

      return data;
    }),
});
