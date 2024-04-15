import React from "react";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { AspectRatio } from "~/components/ui/aspect-ratio";
import { TopText } from "~/components/layout/entry/topText";
import headerImage from "../../public/about.webp";

export default function about() {
  return (
    <>
      <Head>
        <title>Privacy Policy - WhereIsTheGoogleCar</title>
        <meta
          property="og:title"
          content="Privacy Policy - WhereIsTheGoogleCar"
        />
      </Head>

      <div className="flex flex-col gap-2">
        <TopText title="Privacy Policy" />

        {/* dont ask how i came up with that aspect ratio it was */}
        {/* a rookie incident */}
        <AspectRatio ratio={32 / 9} className="bg-muted">
          <Image
            src={headerImage}
            alt="Google Street View Car"
            fill
            className="rounded-md object-cover"
          />
        </AspectRatio>

        <div className="text-background-foreground space-y-3.5 leading-7 [&:not(:first-child)]:mt-6">
          <p>
            WhereIsTheGoogleCar uses a{" "}
            <b>self-hosted instance of Plausible, and Vercel Speed Insights</b>{" "}
            to understand how users interact with our site and to improve the
            user experience.
          </p>

          <p>
            <b>Plausible</b> is designed with privacy in mind, as it does not
            collect any sort of personal information, storing cookies, or
            sharing data with third-parties or advertising companies. Plausible
            (nor we) engage in data mining or harvesting, nor do we monetize any
            information collected. We gather anonymous usage data solely for
            statistical purposes, ensuring that individual visitors remain
            untracked.{" "}
            <b>
              The aggregated data that we can see, includes referral sources,
              top pages, visit duration, and device information.
            </b>
          </p>

          <p>
            For more information regarding Plausible, please see their{" "}
            <a
              href="https://plausible.io/data-policy"
              className="font-medium text-primary underline underline-offset-4"
            >
              Privacy and Compliance
            </a>{" "}
            page.
          </p>

          <p>
            <b>Vercel Speed Insights</b> is also used to monitor the performance
            of the site. This data is also anonymous and does not collect any
            personal information. For more information, please see their{" "}
            <a
              href="https://vercel.com/docs/speed-insights/privacy-policy"
              className="font-medium text-primary underline underline-offset-4"
            >
              Privacy and Compliance
            </a>{" "}
            page.
          </p>
        </div>
      </div>
    </>
  );
}
