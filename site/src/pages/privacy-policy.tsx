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
            WhereIsTheGoogleCar uses Vercel Web Analytics to understand how
            users interact with our site and to improve the user experience.
          </p>

          <p>
            Vercel Web Analytics is designed with privacy in mind. It does not
            collect or store any information that would enable us to reconstruct
            an user&apos;s browsing session across different applications or
            websites, or personally identify an end user. No personal
            identifiers that track and cross-check users data across different
            applications or websites are collected. By default, Vercel Web
            Analytics allows us to use only aggregated data that cannot identify
            or re-identify customers&apos; end users.
          </p>

          <p>
            The recording of data points (i.e. pageviews, custom events) is
            anonymous, so we have insight into our data without it being tied to
            or associated with any individual, customer, or IP address. Users
            are identified by a hash created from the incoming request. This
            hash is not stored permanently and is automatically discarded after
            24 hours.
          </p>

          <p>The following data is collected:</p>

          <table className="w-full">
            <thead>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  Collected Value
                </th>
                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  Example Value
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Event Timestamp
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  2020-10-29 09:06:30
                </td>
              </tr>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  URL
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  /blog/nextjs-10
                </td>
              </tr>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Dynamic Path
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  /blog/[slug]
                </td>
              </tr>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Referrer
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  https://news.ycombinator.com/
                </td>
              </tr>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Query Params (Filtered)
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  ?ref=hackernews
                </td>
              </tr>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Geolocation
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  US, California, San Francisco
                </td>
              </tr>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Device OS & Version
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Android 10
                </td>
              </tr>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Browser & Version
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Chrome 86 (Blink)
                </td>
              </tr>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Device Type
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Mobile (or Desktop/Tablet)
                </td>
              </tr>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  Web Analytics Script Version
                </td>
                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                  1.0.0
                </td>
              </tr>
            </tbody>
          </table>

          <p>
            For more information regarding Vercel Web Analytics, please see
            their{" "}
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
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
