import React from "react";

import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";

export const HomeSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      <TitleSkeleton />

      <CardSetSkeleton />
    </div>
  );
};

export const TitleSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <Separator />

      <Skeleton className="h-9 w-full scroll-m-20 text-4xl md:h-12" />

      <Separator />
    </div>
  );
};

export const CardSetSkeleton = () => {
  return (
    <div className="flex flex-wrap justify-center gap-x-16 gap-y-6">
      {Array.from({ length: 9 }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return <Skeleton className="h-72 w-96 lg:w-[402px]" />;
};
