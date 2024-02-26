import React from "react";

import Image from "next/image";
import Link from "next/link";

import { TopText } from "~/components/layout/entry/topText";
import { AspectRatio } from "~/components/ui/aspect-ratio";

export const PageComponent = (props: pageProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Top Title */}
      <div className="w-full">
        <TopText title={props.dateFormatted} emote={props.data.countryEmoji} />
      </div>

      {/* Description */}
      <div className="flex items-start justify-between self-stretch">
        <div className="text-lg text-slate-500">{props.data.town}</div>
        <div className="flex gap-4">
          <Link
            className="text-lg font-medium text-slate-500 underline"
            href={props.data.sourceUrl}
          >
            Source
          </Link>

          {props.data.locationUrl && (
            <Link
              href={props.data.locationUrl}
              className="text-lg font-medium text-slate-500 underline"
            >
              Location
            </Link>
          )}
        </div>
      </div>

      <div className="w-full">
        {/* TODO: adapt image into aspect ratio and not crop it */}
        <AspectRatio ratio={16 / 9} className="bg-muted">
          <Image
            src={props.data.imageUrl}
            alt="Google Street View Car"
            fill
            className="rounded-md object-cover"
          />
        </AspectRatio>
      </div>
    </div>
  );
};
