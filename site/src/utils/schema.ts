import { z } from "zod";

export const infoItemSchema = z.object({
  id: z.number(),
  date: z.string(),
  town: z.string(),
  countryEmoji: z.string(),
  imageUrl: z.string(),
  sourceUrl: z.string(),
  locationUrl: z.string().optional(),
});

export const infoPropsSchema = z.array(
  z.object({
    month: z.string(),
    year: z.string(),
    info: z.array(infoItemSchema),
  }),
);
