import React from "react";
import { TopText } from "~/components/layout/entry/topText";

import Image from "next/image";
import { AspectRatio } from "~/components/ui/aspect-ratio";

// i may use markdown in case if i have to extend this
// further as a F.A.Q. section

export default function about() {
  return (
    <div className="flex flex-col gap-6">
      <TopText title="About" />

      {/* dont ask how i came up with that aspect ratio it was */}
      {/* a rookie incident */}
      <AspectRatio ratio={32 / 9} className="bg-muted">
        <Image
          src="/about.webp"
          alt="Google Street View Car"
          fill
          className="rounded-md object-cover"
        />
      </AspectRatio>

      <div className="text-background-foreground space-y-3.5">
        <h2 className="scroll-m-20 text-4xl font-extrabold italic tracking-tight underline underline-offset-4 lg:text-5xl">
          We are NOT Google
        </h2>

        <p>
          Instead, we are the largest public database of Google Street View
          Driving Sightings! Our contributions are made by enthusiasts who love
          Google Street View. Since 2021, we have been monitoring Google Street
          View Vehicle Spottings that are being identified and shared online,
          and our documentation extends back to 2013.
        </p>

        <p>
          All contributions are done by the VirtualStreets community, and we are
          not affiliated with Google (nor any other mapping company) in any way.
        </p>

        <p>
          All pictures are owned by their respective authors. If you are the
          owner of a picture in this site and would like it removed, please
          contact us.
        </p>

        <p>
          We also do not know if Google (or any other Street View service) will
          drive to a specified location.{" "}
          <a
            className="font-medium text-blue-600 underline visited:text-purple-600 hover:text-blue-800"
            href="https://www.google.com/streetview/"
          >
            Please refer to the official site of the mapping service for the
            most up-to-date information.
          </a>
        </p>

        <p>
          This site is developed and maintained by shmugo. Although I&apos;m
          doing this more for fun than money, and I don&apos;t ever plan on
          profiting off other people&apos;s contributions, I would appreciate it
          if you could help me cover the costs of running this site! You can do
          so by donating to my Ko-fi.
        </p>
      </div>
    </div>
  );
}
