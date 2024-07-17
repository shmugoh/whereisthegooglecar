import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

import { TopText } from "~/components/layout/entry/topText";
import {
  LocationButton,
  SourceButton,
  TextBluePrint,
} from "~/components/layout/entry/output";
import { ImagePreview } from "~/components/layout/entry/image";
import { CardSkeleton, HomeSkeleton } from "~/components/layout/entry/skeleton";

import { convertDate } from "~/utils/date";
import twemoji from "@twemoji/api";
import { env } from "~/env";
import ServiceBadge from "./service_badge";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const SpottingCard = (props: cardProps) => {
  // format date
  const date = convertDate(props.date);

  return (
    <div className="w-96 lg:w-[402px]">
      <Card className="-space-y-4">
        <CardHeader>
          <CardTitle>
            <div className="flex w-full flex-row justify-between gap-20">
              <h2 className="flex items-center justify-start text-3xl font-semibold">
                {date}
              </h2>

              <div className="flex items-center justify-end">
                <span
                  dangerouslySetInnerHTML={{
                    __html: twemoji.parse(props.country_emoji, {
                      folder: "svg",
                      ext: ".svg",
                    }),
                  }}
                  className="w-12 lg:w-9"
                />
              </div>
            </div>
          </CardTitle>
          <CardDescription className="flex items-center justify-between gap-2 break-words">
            <TextBluePrint text={props.town} size="base" />

            <ServiceBadge service={props.company} className="h-fit" />
          </CardDescription>
        </CardHeader>
        <CardContent className="hidden lg:block">
          <ImagePreview
            url={`${props.image}`}
            alt={`Picture of a Google Car spotted in ${props.town} on ${date}.`}
            ratio={16 / 9}
          />
        </CardContent>
        <CardContent className="lg:hidden">
          <ImagePreview
            url={`${props.image}`}
            alt={`Picture of a Google Car spotted in ${props.town} on ${date}.`}
            ratio={props.width / props.height}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <SourceButton url={props.source} size="sm" />
            {props.location && (
              <LocationButton url={props.location} size="sm" />
            )}
          </div>
          <div className="flex items-center md:w-1/3">
            <Button className="flex h-full w-full items-center" asChild>
              <Link prefetch={false} href={`/spotting/${props.id}`}>
                Info
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export const CardSet = (props: cardSetProps) => {
  if (props.info.length === 0) {
    return <HomeSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <TopText title={monthNames[props.month]!} right={props.year} />
      <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6">
        {props.info.map((item: cardProps) => (
          <SpottingCard
            id={item.id}
            key={item.id}
            date={item.date}
            town={item.town}
            country_emoji={item.country_emoji}
            image={item.image}
            source={item.source}
            location={item.location}
            company={props.showCompany ? item.company : undefined}
            width={item.width}
            height={item.height}
          />
        ))}
        {props.showSkeleton === true
          ? Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)
          : null}
      </div>
    </div>
  );
};
