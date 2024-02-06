import React from "react";
import { Separator } from "~/components/ui/separator";

type propsTopText = {
  title: string;
  right?: string;
  emote?: string;
};

export const TopText = (props: propsTopText) => {
  return (
    <div className="flex flex-col gap-2">
      <Separator />
      <div className="textContainer flex flex-wrap md:flex-nowrap">
        <h1 className="w-full scroll-m-20 text-6xl font-extrabold leading-[normal]">
          {props.title}
        </h1>
        {props.right && (
          <h1 className="scroll-m-20 text-6xl font-extrabold leading-[normal]">
            {props.right}
          </h1>
        )}
        {/* <p>emote</p> */}
      </div>

      <Separator />
    </div>
  );
};
