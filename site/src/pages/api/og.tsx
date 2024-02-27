import { ImageResponse } from "@vercel/og";
import { type NextRequest } from "next/server";

import { AspectRatio } from "~/components/ui/aspect-ratio";

export const config = {
  runtime: "edge",
};

export default function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const imageUrl = searchParams.get("img");
  // const town = searchParams.get("town");
  // const date = searchParams.get("date");
  // const emoji = searchParams.get("emoji");

  console.log(imageUrl);

  if (imageUrl) {
    return new ImageResponse(
      (
        <div tw="w-full h-full flex overflow-hidden relative">
          <img
            src={imageUrl}
            width="1200px"
            height="630px"
            style={{ width: "1200px", height: "630px", objectFit: "cover" }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        emoji: "twemoji",
      },
    );
  }
}
