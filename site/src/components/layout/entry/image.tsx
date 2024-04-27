import React, { useEffect, useState } from "react";

import Image from "next/image";
import { AspectRatio } from "~/components/ui/aspect-ratio";

export const ImagePreview = (props: {
  className?: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}) => {
  const { width, height } = props;

  // handle aspect ratio (for mobile)
  const [aspectRatio, setAspectRatio] = useState(width / height); // default aspect ratio
  const handleAspectRatio = (screenWidth: number) => {
    if (screenWidth <= 768) {
      setAspectRatio(width / height);
    } else {
      setAspectRatio(16 / 9);
    }
  };

  // window width listener
  window.addEventListener("resize", (e) => {
    const window = e.currentTarget as Window;
    handleAspectRatio(window.innerWidth);
  });

  // window width on load
  useEffect(() => {
    handleAspectRatio(window.innerWidth);
  }, []);

  return (
    <div className={props.className}>
      <AspectRatio ratio={aspectRatio} className="relative bg-muted">
        <Image
          src={props.url}
          alt={props.alt}
          fill
          className="rounded-md object-contain"
          style={{ zIndex: 1 }}
          // onLoadingComplete={handleLoadingComplete}
          loading={"eager"}
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
