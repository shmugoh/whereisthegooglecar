import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { literal, z } from "zod";
import { env } from "~/env";
import { generateEmbed } from "~/utils/embed_webhook";
import { formSchema } from "~/utils/formSchema";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateFileName } from "~/utils/sha256";
import { TRPCError } from "@trpc/server";

// constants
const DiscordWebHookURL = env.DISCORD_WEBHOOK_URL;
const allowedFileTypes = ["image/jpeg", "image/png"];
const maxFileSize = 1048576 * 10; // 10 MB
const s3 = new S3Client({
  region: env.AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: env.AWS_S3_ACCESS_KEY,
    secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

// turnstile validation
async function validate_turnstile(token: string): Promise<boolean> {
  // build form data
  const formData = new FormData();
  formData.append("secret", env.CF_TURNSTILE_KEY);
  formData.append("response", token);

  // build url & request
  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const result = await fetch(url, {
    body: formData,
    method: "POST",
  });

  // get response
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const response = await result.json();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return response?.success;
}

export const formRouter = createTRPCRouter({
  presign_s3: publicProcedure
    .input(
      z.object({
        cf_turnstile_token: z.string(),
        checksum: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // verify cloudflare turnstile
      try {
        const turnstile_response = await validate_turnstile(
          input.cf_turnstile_token,
        );
        if (!turnstile_response) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid Turnstile Token",
          });
        }
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "An internal error occurred while verifying Turnstile Captcha",
        });
      }

      if (!allowedFileTypes.includes(input.fileType)) {
        throw new TRPCError({
          code: "METHOD_NOT_SUPPORTED",
          message: "File Type not allowed.",
        });
      }
      if (input.fileSize > maxFileSize) {
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message:
            "File size is too large. Please compress your image down to 10MB and try again.",
        });
      }

      try {
        // generate image filename for s3
        const imageFileName = `${generateFileName(8)}.${input.fileType.split("/")[1]}`;

        // generate signed url for aws
        const putObjectCommand = new PutObjectCommand({
          Bucket: env.AWS_S3_BUCKET_NAME,
          Key: `submissions/${imageFileName}`,
          ContentType: input.fileType,
          ContentLength: input.fileSize,
          ChecksumSHA256: input.checksum,
        });
        const signedURL = await getSignedUrl(s3, putObjectCommand, {
          expiresIn: 60,
        });

        // return data
        return {
          code: 200,
          message: { url: signedURL, key: `submissions/${imageFileName}` },
        };
      } catch (e) {
        // return http error if something went wrong
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Something went wrong while uploading your image. Please try again.`,
        });
      }
    }),

  submitForm: publicProcedure
    .input(formSchema)
    .mutation(async ({ input, ctx }) => {
      // verify cloudflare turnstile
      const turnstile_response = await validate_turnstile(
        input.cf_turnstile_token,
      );
      if (!turnstile_response) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid Turnstile Token",
        });
      }

      try {
        // create webhook embed
        const embed = generateEmbed({
          date: input.date,
          country: input.country,
          town: input.town,
          source: input.source,
          location: input.location,
          service: input.service,
          imageUrl: input.image,
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
          code: webhookResponse.status,
          message: webhookResponse.statusText,
        };
      } catch (e) {
        // return http error if something went wrong
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Something went wrong while uploading your image. Please try again.`,
        });
      }
    }),

  editForm: publicProcedure
    .input(formSchema)
    .mutation(async ({ input, ctx }) => {
      // verify cloudflare turnstile
      const turnstile_response = await validate_turnstile(
        input.cf_turnstile_token,
      );
      if (!turnstile_response) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid Turnstile Token",
        });
      }

      try {
        // create webhook embed
        const embed = generateEmbed({
          date: input.date,
          country: input.country,
          town: input.town,
          source: input.source,
          location: input.location,
          service: input.service,
          type: "edit",
          id: input.id,
        });

        // submit webhook
        const webhookResponse = await fetch(DiscordWebHookURL, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(embed),
        });

        return {
          code: webhookResponse.status,
          message: webhookResponse.statusText,
        };
      } catch {
        // return http error if something went wrong
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Something went wrong while submiting your form. Please try again.`,
        });
      }
    }),
});
