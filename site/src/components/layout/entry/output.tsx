import React from "react";
import Link from "next/link";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

const ButtonBluePrint = (props: {
  type: string;
  url: string;
  size: "sm" | "lg";
}) => {
  if (!isUrl(props.url)) {
    let text;

    if (props.type === "Source") {
      text = (
        <div className="flex flex-row gap-2">
          <p className="text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
            Submitted by:
          </p>
          {/* font-medium text-primary underline underline-offset-4 */}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold [&[align=center]]:text-center">
            {props.url}
          </code>
        </div>
      );
    }

    return (
      <Popover>
        <PopoverTrigger
          className={`text-${props.size} font-medium text-primary underline underline-offset-4 hover:cursor-pointer hover:text-primary/80`}
        >
          {props.type}
        </PopoverTrigger>
        <PopoverContent>{text}</PopoverContent>
      </Popover>
    );
  }

  return (
    <Link
      href={props.url}
      className={`text-${props.size} font-medium text-primary underline underline-offset-4 hover:cursor-pointer hover:text-primary/80`}
    >
      {props.type}
    </Link>
  );
};

export const TextBluePrint = (props: { text: string; size: "base" | "lg" }) => {
  return (
    <div
      className={`text-${props.size} font-regular text-slate-600 dark:text-slate-300`}
    >
      {props.text}
    </div>
  );
};

export const SourceButton = (props: { url: string; size: "sm" | "lg" }) => {
  return <ButtonBluePrint type="Source" url={props.url} size={props.size} />;
};

export const LocationButton = (props: { url: string; size: "sm" | "lg" }) => {
  return <ButtonBluePrint type="Location" url={props.url} size={props.size} />;
};

function isUrl(s: string): boolean {
  if (typeof s !== "string") return false; // for elements

  return s.startsWith("http://") || s.startsWith("https://");
}
