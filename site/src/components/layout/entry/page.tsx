import React, { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { TopText } from "~/components/layout/entry/topText";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { LocationButton, SourceButton, TextBluePrint } from "./output";
import { ImagePreview } from "~/components/layout/entry/image";
import EditDialog from "../form/edit";
import ServiceBadge from "./service_badge";

export const PageComponent = (props: pageProps) => {
  // handle aspect ratio (for mobile)
  const [aspectRatio, setAspectRatio] = useState(16 / 9); // default aspect ratio

  const handleLoadingComplete = ({
    naturalWidth,
    naturalHeight,
  }: {
    // type definitions
    naturalWidth: number;
    naturalHeight: number;
  }) => {
    // if on pc, stay with 16/9
    if (window.innerWidth >= 1024) {
      return;
    }

    setAspectRatio(naturalWidth / naturalHeight);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Top Title */}
      <div className="w-full">
        <TopText title={props.dateFormatted} emote={props.data.countryEmoji} />
      </div>

      {/* Description */}
      <div className="flex flex-col items-start justify-between gap-2 self-stretch md:flex-row">
        <div className="flex w-full gap-4">
          <ServiceBadge service={props.data.company} />

          <TextBluePrint
            text={props.data.town}
            size="lg"
            className="w-full text-right md:text-left"
          />
        </div>
        <div className="flex w-full justify-between gap-4  md:w-fit md:flex-row md:justify-normal">
          <SourceButton url={props.data.sourceUrl} size="lg" />

          {props.data.locationUrl && (
            <LocationButton url={props.data.locationUrl} size="lg" />
          )}

          <EditDialog
            size="lg"
            date={new Date(props.dateFormatted)}
            town={props.data.town}
            country={props.data.countryEmoji}
            source={props.data.sourceUrl}
            location={props.data.locationUrl ?? undefined}
          />
        </div>
      </div>

      {/* Image Preview */}
      <ImagePreview
        className="w-full md:w-11/12"
        url={props.data.imageUrl}
        alt={`Picture of a ${props.data.company === "others" ? "Street View" : props.data.company.charAt(0).toUpperCase() + props.data.company.slice(1)} Car spotted in ${props.data.town} on ${props.dateFormatted}.`}
        loading="eager"
      />
    </div>
  );
};
