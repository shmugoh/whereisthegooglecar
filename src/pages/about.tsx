import React from "react";
import { TopText } from "~/components/layout/entry/topText";

import Image from "next/image";
import { AspectRatio } from "~/components/ui/aspect-ratio";

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

      <div className="space-y-3.5">
        <h2 className="scroll-m-20 text-4xl font-extrabold italic tracking-tight underline underline-offset-4 lg:text-5xl">
          We are NOT Google
        </h2>

        <p>
          Instead, we are the largest public database of Google Street View
          Driving Schedules! Our contributions are made by enthusiasts who love
          Google Street View. Since 2021, we have been monitoring Google Street
          View Vehicle Routes that are being identified and shared online, and
          our documentation extends back to 2013.
        </p>
      </div>
    </div>
  );
}
