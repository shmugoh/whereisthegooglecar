import Image from "next/image";
import { AspectRatio } from "~/components/ui/aspect-ratio";

import twemoji from "twemoji";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { TopText } from "~/components/layout/entry/topText";

type cardProps = {
  date: string;
  town: string;
  countryEmoji: string;
  imageUrl: string;
  sourceUrl: string;
  locationUrl?: string;
};

export const GoogleCard = (props: cardProps) => {
  return (
    <div>
      <Card className="w-full -space-y-4">
        <CardHeader>
          <CardTitle>
            <div className="flex w-full flex-row justify-between gap-20">
              <h2 className="text-3xl font-semibold">{props.date}</h2>
              <span
                dangerouslySetInnerHTML={{
                  __html: twemoji.parse(props.countryEmoji),
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
                alt={`Picture of a Google Car spotted in ${props.town} on ${props.date}.`}
                className="rounded-md object-cover"
              />
            </AspectRatio>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <a
            href={props.locationUrl}
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
        </CardFooter>
      </Card>
    </div>
  );
};

export const CardSet = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      <TopText title="February" right="2024" />
      <div className="flex flex-wrap gap-x-16 gap-y-6">
        <GoogleCard
          date="February 1st, 2023"
          town="Bogota, Colombia"
          countryEmoji="🇨🇴"
          imageUrl="https://cdn.discordapp.com/attachments/774703077172838430/1189837268148568194/28_12_2023.png"
          sourceUrl="#"
        />
        <GoogleCard
          date="February 1st, 2023"
          town="Bogota, Colombia"
          countryEmoji="🇨🇴"
          imageUrl="https://cdn.discordapp.com/attachments/774703077172838430/1169141068843991100/image.png?ex=65cc4af8&is=65b9d5f8&hm=8824a7b577de07b393094e62a38686ac66ce012243ce8bed27c242ff80577b42&"
          sourceUrl="#"
        />
        <GoogleCard
          date="February 1st, 2023"
          town="Bogota, Colombia"
          countryEmoji="🇨🇴"
          imageUrl="https://cdn.discordapp.com/attachments/774703077172838430/1189837268148568194/28_12_2023.png"
          sourceUrl="#"
        />
      </div>
    </div>
  );
};
