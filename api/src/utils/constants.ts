import { type Context } from "hono";

export type Env = {
  DATABASE_URL: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;

  CORS_ORIGIN: string[];
  CSRF_ORIGIN: string[];

  CF_TURNSTILE_KEY: string;

  AWS_S3_BUCKET_REGION: string;
  AWS_S3_BUCKET_NAME: string;
  AWS_S3_ACCESS_KEY: string;
  AWS_S3_SECRET_ACCESS_KEY: string;

  DISCORD_WEBHOOK_URL: string;
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

export const MAX_FILE_SIZE = 1048576 * 10; // 10 MB
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];
export const TTL_EXPIRATION = 15;
