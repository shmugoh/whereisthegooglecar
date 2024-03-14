import React from "react";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { AspectRatio } from "~/components/ui/aspect-ratio";
import { TopText } from "~/components/layout/entry/topText";
import headerImage from "../../public/about.webp";

// i may use markdown in case if i have to extend this
// further as a F.A.Q. section
// update: tailwind kept messing with the text's typography
// and i had to manually force prose to work... which somehow doesn't work on build
/// this is confusing

export default function about() {
  return (
    <>
      <Head>
        <title>About - WhereIsTheGoogleCar</title>
        <meta property="og:title" content="About - WhereIsTheGoogleCar" />
      </Head>

      <div className="flex flex-col gap-2">
        <TopText title="About" />

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

        <div className="text-background-foreground space-y-3.5 leading-7">
          <h2 className="border-p scroll-m-20 text-3xl font-extrabold italic tracking-tight underline underline-offset-4">
            We are NOT Google
          </h2>

          <p>
            Instead, we are the largest public database of Street View
            Sightings! Our contributions are made by enthusiasts who love Google
            Street View. Since 2020, we have been monitoring Google Street View
            Vehicle Spottings that are being identified and shared online, and
            our documentation extends back to 2007. We also document sightings
            of other Street View services, such as Apple Maps.
          </p>

          <p>
            All contributions are done by the VirtualStreets community, and we
            are not affiliated with Google (nor any other mapping company) in
            any way.
          </p>

          <p>
            All pictures are owned by their respective authors. If you are the
            owner of a picture in this site and would like it removed, please
            contact us.
          </p>

          <p>
            This site is developed and maintained by shmugo. Although I&apos;m
            doing this more for fun than money, and I don&apos;t ever plan on
            profiting off other people&apos;s contributions, I would appreciate
            it if you could help me cover the costs of running this site! You
            can do so by donating to my Ko-fi.
          </p>
        </div>

        <TopText title="FAQ" />
        <div className="text-background-foreground">
          <span className="space-y-3.5">
            <h2 className="border-p scroll-m-20 text-3xl font-extrabold italic tracking-tight underline underline-offset-4">
              Where do you get your data?
            </h2>
            <p>
              Data is obtained from VirtualStreets volunteers who submit their
              sightings.
            </p>
          </span>

          <span className="space-y-3.5 p-2">
            <h2 className="border-p scroll-m-20 text-3xl font-extrabold italic tracking-tight underline underline-offset-4">
              When will Google (or Apple) drive by my location?
            </h2>
            <p>
              We do not know if Google (or any other Street View service) will
              drive to a specified location.{" "}
            </p>

            <p>
              Please refer to the following Street View providers&apos; official
              schedules for more information:
            </p>
            <ul className="my-6 ml-6 list-disc font-medium text-primary underline underline-offset-4 [&>li]:mt-2">
              <li>
                <Link href="https://www.google.com/streetview/how-it-works/#district-filter">
                  Google
                </Link>
              </li>
              <li>
                <Link href="https://maps.apple.com/imagecollection/locations">
                  Apple
                </Link>
              </li>
            </ul>

            <p>
              You can also{" "}
              <Link
                className="list-disc font-medium text-primary underline underline-offset-4 [&>li]:mt-2"
                href="https://virtualstreets.org/"
              >
                read our articles here
              </Link>{" "}
              for any official confirmation (from a government entity or from
              the service) that isn&apos;t displayed on the Street View
              providers&apos; site.
            </p>
          </span>

          <span className="space-y-3.5">
            <h2 className="border-p scroll-m-20 text-3xl font-extrabold italic tracking-tight underline underline-offset-4">
              I just saw a Street View car (or have an old picture), how do I
              submit it?
            </h2>
            <p>
              Tweet us at{" "}
              <Link
                href="https://twitter.com/VirtualStreets_"
                className="list-disc font-medium text-primary underline underline-offset-4 [&>li]:mt-2"
              >
                @VirtualStreets_
              </Link>{" "}
              on Twitter with the date, image, and location (if possible) to
              submit your sighting. Once approved, your submission will be added
              to the website, and a link will be sent.
            </p>
          </span>

          <span className="space-y-3.5">
            <h2 className="border-p scroll-m-20 text-3xl font-extrabold italic tracking-tight underline underline-offset-4">
              Are you affiliated with the previous whereisthegooglecar.com or
              any of its owners?
            </h2>
            <p>No.</p>
          </span>
        </div>
      </div>
    </>
  );
}
