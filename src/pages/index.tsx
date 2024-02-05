import Link from "next/link";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";

import { api } from "~/utils/api";

import { CardSet } from "~/components/layout/entry/card";

import { infoPropsSchema } from "~/utils/schema";

export const getServerSideProps = async () => {
  // Fetch data from external API
  const info = [
    {
      month: "February",
      year: "2024",
      info: [
        {
          id: 0,
          date: "February 1, 2024",
          town: "Bogota, Colombia",
          countryEmoji: "🇨🇴",
          imageUrl:
            "https://cdn.discordapp.com/attachments/774703077172838430/1139459856332496966/IMG_1732.png",
          sourceUrl: "#",
          locationUrl: "https://example.com/location",
        },
      ],
    },
  ];

  // Validate the data against the schema
  const validatedInfo = infoPropsSchema.parse(info);

  // Pass data to the page via props
  return { props: { info: validatedInfo } };
};

export default function Home({
  info,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="flex flex-col items-center gap-4">
      {info.map((item, index) => (
        <CardSet key={index} {...item} />
      ))}
    </div>
  );
}
