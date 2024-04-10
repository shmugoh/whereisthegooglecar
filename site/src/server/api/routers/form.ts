import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { env } from "~/env";

const DiscordWebHookURL = env.DISCORD_WEBHOOK;

export const formRouter = createTRPCRouter({
  submitForm: publicProcedure
    .input(
      z.object({
        date: z.date(),
        country: z.string(),
        town: z.string(),
        source: z.string(),
        location: z.string().url().optional(),
        service: z.string().optional(),
        // image: z.string()
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // verify cloudflare turnstile
      // TODO
      //

      // submit webhook
      const webhookResponse = await fetch(DiscordWebHookURL, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // username
          username: "WhereIsTheGoogleCar - Form",
          // embeds to be sent
          embeds: [
            {
              // decimal number colour of the side of the embed
              color: 11730954,

              // title
              title: "WhereIsTheGoogleCar - New Submission",

              // fields
              fields: [
                {
                  name: "Date",
                  value: input.date,
                },
                {
                  name: "Town",
                  value: input.town,
                },
                {
                  name: "Country",
                  value: input.country,
                },
                {
                  name: "Source",
                  value: input.source,
                },
                {
                  name: "Location",
                  value: input.location ? input.location : "N/A",
                },
                {
                  name: "Service",
                  value: input.service ? input.service : "N/A",
                },
              ],

              // image
              image: {
                url: "https://cdn.whereisthegooglecar.com/images/1227561801143812107.webp",
              },
            },
          ],
        }),
      });

      console.log(webhookResponse.status, webhookResponse.statusText);
      return {
        status: webhookResponse.status,
        message: webhookResponse.statusText,
      };
    }),
});
