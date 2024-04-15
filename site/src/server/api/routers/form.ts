import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { env } from "~/env";
import { generateEmbed } from "~/utils/embed_webhook";
import { formSchema } from "~/utils/formSchema";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateFileName } from "~/utils/sha256";

const DiscordWebHookURL = env.DISCORD_WEBHOOK_URL;

// aws & post settings
const s3 = new S3Client({
  region: env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
const allowedFileTypes = ["image/jpeg", "image/png"];
const maxFileSize = 1048576 * 10; // 10 MB

export const formRouter = createTRPCRouter({
  presignS3: publicProcedure
    .input(
      z.object({
        // cf_turnstile: z.string(),
        checksum: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!allowedFileTypes.includes(input.fileType)) {
        return { failure: "File Type not allowed" };
      }
      if (input.fileSize > maxFileSize) {
        return { failure: "File Size too large" };
      }

      const imageFileName = generateFileName(8);

      const putObjectCommand = new PutObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: `submissions/${imageFileName}`,
        ContentType: input.fileType,
        ContentLength: input.fileSize,
        ChecksumSHA256: input.checksum,
      });

      const signedURL = await getSignedUrl(s3, putObjectCommand, {
        expiresIn: 60,
      });

      return { url: signedURL, key: `submissions/${imageFileName}` };
    }),

  submitForm: publicProcedure
    .input(formSchema)
    .mutation(async ({ input, ctx }) => {
      // verify cloudflare turnstile
      // TODO
      //

      // create webhook embed
      const embed = generateEmbed({
        date: input.date,
        country: input.country,
        town: input.town,
        source: input.source,
        location: input.location,
        service: input.service,
        type: "new",
      });

      // submit webhook
      const webhookResponse = await fetch(DiscordWebHookURL, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(embed),
      });

      console.log(webhookResponse.status, webhookResponse.statusText);
      return {
        status: webhookResponse.status,
        message: webhookResponse.statusText,
      };
    }),

  editForm: publicProcedure
    .input(
      z.object({
        date: z.date(),
        country: z.string(),
        town: z.string(),
        source: z.string(),
        location: z.string().url().optional(),
        service: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // verify cloudflare turnstile
      // TODO
      //

      // create webhook embed
      const embed = generateEmbed({
        date: input.date,
        country: input.country,
        town: input.town,
        source: input.source,
        location: input.location,
        service: input.service,
        type: "edit",
      });

      // submit webhook
      const webhookResponse = await fetch(DiscordWebHookURL, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(embed),
      });

      console.log(webhookResponse.status, webhookResponse.statusText);
      return {
        status: webhookResponse.status,
        message: webhookResponse.statusText,
      };
    }),
});
