import React from "react";
import twemoji from "twemoji";
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
      <div className="textContainer md: flex flex-wrap justify-normal justify-center md:flex-nowrap">
        <h1 className="w-full scroll-m-20 text-center text-6xl font-extrabold leading-[normal] md:text-left">
          {props.title}
        </h1>
        {props.right && (
          <h1 className="scroll-m-20 text-6xl font-extrabold leading-[normal]">
            {props.right}
          </h1>
        )}
        {props.emote && (
          <span
            dangerouslySetInnerHTML={{
              __html: twemoji.parse(props.emote, {
                folder: "svg",
                ext: ".svg",
              }),
            }}
            className="flex w-16"
          />
        )}
      </div>

      <Separator />
    </div>
  );
};
