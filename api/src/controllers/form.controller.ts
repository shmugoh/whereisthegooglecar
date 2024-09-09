import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateFileName } from "../utils/form/sha256";
import {
  ALLOWED_FILE_TYPES,
  ContextType,
  MAX_FILE_SIZE,
  TTL_EXPIRATION,
} from "../utils/constants";
import { Redis } from "@upstash/redis/cloudflare";
import { HTTPException } from "hono/http-exception";
import { generateEmbed } from "../utils/form/embed_webhook";

import { PresignSchema, FormSchema } from "../utils/schemas/input_schema";
import { z } from "zod";

async function validateTurnstile(c: ContextType, token: string) {
  try {
    // initiate redis
    const redis = Redis.fromEnv(c.env);

    // revalidates TTL (removes old tokens)
    const min = 0;
    const max = Math.floor(Date.now() / 1000);
    await redis.zremrangebyscore("turnstile_tokens", min, max);

    // check if token is still available in the sorted set
    const turnstile_cache = await redis.zscore("turnstile_tokens", token);
    if (turnstile_cache == 1) {
      return true;
    }

    // build form data
    const formData = new FormData();
    formData.append("secret", c.env.CF_TURNSTILE_KEY);
    formData.append("response", token);

    // build url & request
    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const response = await fetch(url, {
      body: formData,
      method: "POST",
    });

    // get response
    const response_body = (await response.json()) as any;
    if (response_body.success) {
      // calculate TTL
      const now = Math.floor(Date.now() / 1000); // current time in seconds
      const expirationTime = now + TTL_EXPIRATION; // expiration time
      await redis.zadd("turnstile_tokens", {
        score: expirationTime,
        member: token,
      });

      return true;
    }

    return false;
  } catch (e) {
    throw e;
  }
}

class FormController {
  async presignS3(
    c: ContextType,
    props: z.infer<typeof PresignSchema>
  ): Promise<presign_s3_output | form_output> {
    try {
      // prettier-ignore
      const turnstile_response = await validateTurnstile(c, props.cf_turnstile_token);
      if (!turnstile_response) {
        throw new HTTPException(403, { message: "Invalid Turnstile Token" });
      }
    } catch (e) {
      throw new HTTPException(500, {
        message: `Internal Server Error: ${JSON.stringify(e)}`,
      });
    }

    if (!ALLOWED_FILE_TYPES.includes(props.fileType)) {
      throw new HTTPException(415, { message: "File Type not allowed." });
    }
    if (props.fileSize > MAX_FILE_SIZE) {
      throw new HTTPException(413, {
        message:
          "File size is too large. Please compress your image down to 10MB and try again.",
      });
    }

    try {
      // generate image filename for s3
      const imageFileName = `${generateFileName(8)}.${
        props.fileType.split("/")[1]
      }`;

      // initiate S3 client
      const s3 = new S3Client({
        region: c.env.AWS_S3_BUCKET_REGION,
        credentials: {
          accessKeyId: c.env.AWS_S3_ACCESS_KEY,
          secretAccessKey: c.env.AWS_S3_SECRET_ACCESS_KEY,
        },
      });

      // generate signed url for aws
      const putObjectCommand = new PutObjectCommand({
        Bucket: c.env.AWS_S3_BUCKET_NAME,
        Key: `submissions/${imageFileName}`,
        ContentType: props.fileType,
        ContentLength: props.fileSize,
        ChecksumSHA256: props.checksum,
      });
      const signedURL = await getSignedUrl(s3, putObjectCommand, {
        expiresIn: 60,
      });

      // return data
      return {
        url: signedURL,
        key: `submissions/${imageFileName}`,
      };
    } catch (e) {
      // return http error if something went wrong
      throw new HTTPException(500, {
        message: `Something went wrong while uploading your image: ${JSON.stringify(
          e
        )}.`,
      });
    }
  }

  async submitForm(
    c: ContextType,
    input: z.infer<typeof FormSchema>
  ): Promise<form_output> {
    // verify cloudflare turnstile captcha
    // prettier-ignore
    const turnstile_response = validateTurnstile(c, input.cf_turnstile_token);
    if (!turnstile_response) {
      throw new HTTPException(403, { message: "Invalid Turnstile Token" });
    }

    try {
      // create webhook embed
      const embed = generateEmbed({
        date: new Date(input.date),
        country: input.country,
        town: input.town,
        source: input.source,
        location: input.location,
        service: input.service,
        imageUrl: input.image,
        type: "new",
      });

      // submit webhook
      const webhookResponse = await fetch(c.env.DISCORD_WEBHOOK_URL, {
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
      throw new HTTPException(500, {
        message: `Something went wrong while submitting: ${JSON.stringify(e)}`,
      });
    }
  }

  async editForm(
    c: ContextType,
    input: z.infer<typeof FormSchema>
  ): Promise<form_output> {
    // verify cloudflare turnstile captcha
    // prettier-ignore
    const turnstile_response = validateTurnstile(c, input.cf_turnstile_token);
    if (!turnstile_response) {
      throw new HTTPException(403, { message: "Invalid Turnstile Token" });
    }

    try {
      // create webhook embed
      const embed = generateEmbed({
        date: new Date(input.date),
        country: input.country,
        town: input.town,
        source: input.source,
        location: input.location,
        service: input.service,
        type: "edit",
        id: input.id,
      });

      // submit webhook
      const webhookResponse = await fetch(c.env.DISCORD_WEBHOOK_URL, {
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
    } catch (e) {
      // return http error if something went wrong
      throw new HTTPException(500, {
        message: `Something went wrong while submiting your form: ${JSON.stringify(
          e
        )}`,
      });
    }
  }
}

export const formController = new FormController();
