import React, { useState } from "react";

import Image from "next/image";
import { AspectRatio } from "~/components/ui/aspect-ratio";

export const ImagePreview = (props: {
  className?: string;
  url: string;
  alt: string;
  loading?: "lazy" | "eager" | undefined;
}) => {
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
    <div className={props.className}>
      <AspectRatio ratio={aspectRatio} className="relative bg-muted">
        <Image
          src={props.url}
          alt={props.alt}
          fill
          className="rounded-md object-contain"
          style={{ zIndex: 1 }}
          onLoadingComplete={handleLoadingComplete}
          loading={props.loading ?? "lazy"}
          unoptimized
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
  );
};
