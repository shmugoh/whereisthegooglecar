// ignoring TS here due to microsoft/TypeScript-DOM-lib-generator/1568
// https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1568

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { type z } from "zod";
import { type SearchSchema, type AvailableMonthsSchema } from "./schemas/input_schema";

export function buildURLParams(input: z.infer<typeof SearchSchema> | z.infer<typeof AvailableMonthsSchema>) {
  return new URLSearchParams(input).toString();
}
