import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  queryByFilter: publicProcedure
    .input(
      z.object({
        company: z.string(),
        month: z.string(),
        year: z.string(),
      }),
    )
    .query(({ input, ctx }) => {
      const { company, month, year } = input;

      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(`${year}-${month}-31`);

      return ctx.db.spottings.findMany({
        where: {
          company: company,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: "desc" },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      return db.spottings.findUnique({
        where: { id: input.id },
      });
    }),
});
