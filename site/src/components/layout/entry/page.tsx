import React, { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { TopText } from "~/components/layout/entry/topText";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { LocationButton, SourceButton, TextBluePrint } from "./output";
import { ImagePreview } from "~/components/layout/entry/image";
import EditDialog from "../form/edit";

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
      <div className="flex items-start justify-between self-stretch">
        <TextBluePrint text={props.data.town} size="lg" />
        <div className="flex gap-4">
          <SourceButton url={props.data.sourceUrl} size="lg" />

          {props.data.locationUrl && (
            <LocationButton url={props.data.locationUrl} size="lg" />
          )}

          <EditDialog size="lg" />
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
