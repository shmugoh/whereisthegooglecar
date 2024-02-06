import Image from "next/image";
import Link from "next/link";
import React from "react";

import { TopText } from "~/components/layout/entry/topText";
import { AspectRatio } from "~/components/ui/aspect-ratio";

import { api } from "~/utils/api";

export default function post() {
  const getById = api.post.getById.useQuery({ id: 1 });

  if (!getById.data) {
    return <div>Loading...</div>;
  }

  if (getById.data) {
    return (
      <div className="flex flex-col items-center gap-4">
        {/* Top Title */}
        <div className="w-full">
          <TopText
            title={getById.data.date.toLocaleString()}
            emote={getById.data.countryEmoji}
          />
        </div>

        {/* Description */}
        <div className="flex items-start justify-between self-stretch">
          <div className="text-xl text-slate-500">{getById.data.town}</div>
          <div className="flex gap-4">
            <Link
              className="text-xl font-medium text-slate-500 underline"
              href={getById.data.sourceUrl}
            >
              Source
            </Link>

            {getById.data.locationUrl && (
              <Link
                href={getById.data.locationUrl}
                className="text-xl font-medium text-slate-500 underline"
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
              src={getById.data.imageUrl}
              alt="Google Street View Car"
              fill
              className="rounded-md object-cover"
            />
          </AspectRatio>
        </div>
      </div>
    );
  }
}
