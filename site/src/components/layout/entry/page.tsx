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

      <div className="w-full md:w-11/12">
        <AspectRatio ratio={16 / 9} className="relative bg-muted">
          <Image
            src={props.data.imageUrl}
            alt="Google Street View Car"
            fill
            className="rounded-md object-contain"
            style={{ zIndex: 1 }}
          />
          {/* <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              // zIndex: -1,
              filter: "blur(8px)",
            }}
          >
            <Image
              src={props.data.imageUrl}
              alt="Google Street View Car"
              fill
              className="rounded-md object-cover"
            />
          </div> */}
        </AspectRatio>
      </div>
    </div>
  );
};
