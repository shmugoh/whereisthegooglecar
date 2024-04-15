import { z } from "zod";
import { Base64 } from "js-base64";

export const formSchema = z.object({
  country: z
    .string()
    .min(4, { message: "Country must be at least 4 characters" }),
  town: z.string().min(1, { message: "Town must at least have 1 character" }),
  source: z
    .string()
    .min(4, { message: "Source must be at least 4 characters" }),
  location: z.string().url().or(z.literal("")).optional(),
  date: z.date(),
  image: z.string().refine(Base64.isValid),
  service: z.string().optional(),
});
