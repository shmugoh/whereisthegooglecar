import { z } from "zod";

/* Spottings */
// Search
export const SearchSchema = z
  .object({
    // these are being converted to integers, as HTTP parameters
    // are parsed as strings
    month: z.string().transform((val) => parseInt(val)),
    year: z.string().transform((val) => parseInt(val)),
    page: z
      .string()
      .default("0")
      .transform((val) => parseInt(val)),
    service: z.string().toLowerCase().optional(),
    town: z.string().optional(),
    country: z.string().optional(),
    cache: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .default("false"),
  })
  .refine(
    (data) => {
      if (data.cache && (data.town ?? data.country)) {
        return false;
      }
      return true;
    },
    {
      message: "Incompatible parameters. Town and Country must be omitted if cache is enabled.",
    },
  );

// ID
export const SearchIDSchema = z.object({
  id: z.string(),
});

/* Metadata */
// Available Months
export const AvailableMonthsSchema = z
  .object({
    service: z.string().toLowerCase().optional(),
    town: z.string().optional(),
    country: z.string().optional(),
    cache: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .default("false"),
  })
  .refine(
    (data) => {
      if (data.cache && (data.town ?? data.country)) {
        return false;
      }
      return true;
    },
    {
      message: "Incompatible parameters. Town and Country must be omitted if cache is enabled.",
    },
  );

/* Form */
// Presign S3 Url
export const PresignSchema = z.object({
  cf_turnstile_token: z.string(),
  checksum: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
});

// Schema for FormSchema
export const FormSchema = z.object({
  country: z.string().min(4, { message: "Country must be at least 4 characters" }),
  town: z.string().min(1, { message: "Town must at least have 1 character" }),
  source: z.string().min(4, { message: "Source must be at least 4 characters" }),
  location: z.string().url().or(z.literal("")).optional(),
  date: z.string().transform((val) => new Date(Date.parse(val))), // this will be changed soon
  service: z.string().default("Others"),
  cf_turnstile_token: z.string(),

  // new only
  image: z.string().url(),

  // edit only
  id: z.string(),
});
