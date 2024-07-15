import { type Context } from "hono";

export type Env = {
  DATABASE_URL: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
};
export type ContextType = Context<{ Bindings: Env }>;

export const PotLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

export const PRIORITY_ORDER = [
  "Google",
  "Apple",
  "Yandex",
  "Here",
  "TomTom",
  "Bing",
  "Baidu",
  "Tencent",
  "Gaode",
];

export const OTHERS_EMOJI = "🌐";

export const PAGINATION_TAKE = 9;
