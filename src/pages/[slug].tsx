import Image from "next/image";
import React from "react";

import { TopText } from "~/components/layout/entry/topText";
import { AspectRatio } from "~/components/ui/aspect-ratio";

export default function post() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Top Title */}
      <div className="w-full">
        <TopText title="February 1st, 2024" emote={"🇨🇴"} />
      </div>

      {/* Description */}
      <div className="flex items-start justify-between self-stretch">
        <div className="text-xl text-slate-500">Bogota, Colombia</div>
        <div className="flex gap-4">
          <div className="text-xl font-medium text-slate-500 underline">
            Source
          </div>
          <div className="text-xl font-medium text-slate-500 underline">
            Location
          </div>
        </div>
      </div>

      <div className="w-full">
        <AspectRatio ratio={16 / 9} className="bg-muted">
          <Image
            src="/about.webp"
            alt="Google Street View Car"
            fill
            className="rounded-md object-cover"
          />
        </AspectRatio>
      </div>
    </div>
  );
}
