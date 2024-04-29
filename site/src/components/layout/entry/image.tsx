import React, { useEffect, useState } from "react";

import Image from "next/image";
import { AspectRatio } from "~/components/ui/aspect-ratio";

export const ImagePreview = (props: {
  className?: string;
  url: string;
  alt: string;
  ratio: number;
}) => {
  return (
    <div className={props.className}>
      <AspectRatio ratio={props.ratio} className="relative bg-muted">
        <Image
          src={props.url}
          alt={props.alt}
          fill
          className="rounded-md object-contain"
          style={{ zIndex: 1 }}
          // onLoadingComplete={handleLoadingComplete}
          priority
          loading={"eager"}
          unoptimized
        />
      </AspectRatio>
    </div>
  );
};
