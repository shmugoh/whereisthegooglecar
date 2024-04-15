import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { env } from "~/env";
import { generateEmbed } from "~/utils/embed_webhook";
import { formSchema } from "~/utils/formSchema";

const DiscordWebHookURL = env.DISCORD_WEBHOOK;

export const formRouter = createTRPCRouter({
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
