import React from "react";
import { Separator } from "~/components/ui/separator";

export const TopText = () => {
  return (
    <div className="flex flex-col gap-2">
      <Separator />
      <div className="textContainer flex flex-wrap md:flex-nowrap">
        <h1 className="w-full scroll-m-20 text-6xl font-extrabold leading-[normal] text-white">
          February
        </h1>
        <h1 className="scroll-m-20 text-6xl font-extrabold leading-[normal] text-white">
          2024
        </h1>
        {/* <p>emote</p> */}
      </div>

      <Separator />
    </div>
  );
};
