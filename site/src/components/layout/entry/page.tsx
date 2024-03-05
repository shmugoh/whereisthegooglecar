import React from "react";

import Image from "next/image";
import Link from "next/link";

import { TopText } from "~/components/layout/entry/topText";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { LocationButton, SourceButton, TextBluePrint } from "./output";

export const PageComponent = (props: pageProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Top Title */}
      <div className="w-full">
        <TopText title={props.dateFormatted} emote={props.data.countryEmoji} />
      </div>

      {/* Description */}
      <div className="flex items-start justify-between self-stretch">
        <TextBluePrint text={props.data.town} size="lg" />
        <div className="flex gap-4">
          <SourceButton url={props.data.sourceUrl} size="lg" />

          {props.data.locationUrl && (
            <LocationButton url={props.data.locationUrl} size="lg" />
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
