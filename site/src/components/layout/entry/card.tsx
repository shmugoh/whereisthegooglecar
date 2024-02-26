import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { TopText } from "~/components/layout/entry/topText";
import { Button } from "~/components/ui/button";
import { AspectRatio } from "~/components/ui/aspect-ratio";

import twemoji from "twemoji";

export const GoogleCard = (props: cardProps) => {
  const date = props.date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    day: "numeric",
  });

  return (
    <div>
      <Card className="w-full -space-y-4">
        <CardHeader>
          <CardTitle>
            <div className="flex w-full flex-row justify-between gap-20">
              <h2 className="text-3xl font-semibold">{date}</h2>
              <span
                dangerouslySetInnerHTML={{
                  __html: twemoji.parse(props.countryEmoji, {
                    folder: "svg",
                    ext: ".svg",
                  }),
                }}
                className="w-full md:w-[36px]"
              />
            </div>
          </CardTitle>
          <CardDescription className="font-regular text-slate-500">
            {props.town}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="">
            <AspectRatio ratio={16 / 9} className="bg-muted">
              <Image
                layout={"fill"}
                objectFit={"contain"}
                src={props.imageUrl}
                alt={`Picture of a Google Car spotted in ${props.town} on ${date}.`}
                className="rounded-md object-cover"
              />
            </AspectRatio>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <a
              href={props.sourceUrl}
              className="text-sm font-medium text-slate-500 underline underline-offset-4 hover:cursor-pointer hover:text-slate-400"
            >
              Source
            </a>
            {props.locationUrl && (
              <a
                href={props.locationUrl}
                className="text-sm font-medium text-slate-500 underline underline-offset-4 hover:cursor-pointer hover:text-slate-400"
              >
                Location
              </a>
            )}
          </div>
          <div className="flex items-center md:w-1/3">
            <Button className="flex h-full w-full items-center" asChild>
              <Link href={`/spotting/${props.id}`}>Info</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export const CardSet = (props: cardSetProps) => {
  return (
    <div className="flex w-full flex-col gap-4">
      <TopText title={props.month} right={props.year} />
      <div className="flex flex-wrap justify-center gap-x-16 gap-y-6 lg:justify-evenly">
        {props.info.map((item: cardProps) => (
          <GoogleCard
            id={item.id}
            key={item.id}
            date={item.date}
            town={item.town}
            countryEmoji={item.countryEmoji}
            imageUrl={item.imageUrl}
            sourceUrl={item.sourceUrl}
            locationUrl={item.locationUrl}
          />
        ))}
      </div>
    </div>
  );
};
