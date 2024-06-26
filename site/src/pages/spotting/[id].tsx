import React from "react";
import { NextSeo } from "next-seo";
import { type InferGetServerSidePropsType } from "next";
import { appRouter } from "~/server/api/root";

import { db } from "~/server/db";
import { PageComponent } from "~/components/layout/entry/page";
import { convertDate } from "~/utils/date";
import { env } from "~/env";

interface IData {
  id: number;
  date: string;
  town: string;
  country: string;
  countryEmoji: string;
  imageUrl: string;
  sourceUrl: string;
  locationUrl: string | null;
  company: string;
  createdAt: string;
  updatedAt: string;
  message_id: string;
  channel_id: string;
}

export default function Page(
  props: InferGetServerSidePropsType<typeof getStaticProps>,
) {
  if (props.data) {
    // format date
    const dateFormatted = convertDate(props.data.date);

    // format service for SEO
    const SERVICE = (() => {
      switch (props.data.company) {
        case "google":
          return "Google Street View";
        case "apple":
          return "Apple Maps";
        case "others":
          return "Street View";
        default:
          return (
            // capitalize first letter
            props.data.company.charAt(0).toUpperCase() +
            props.data.company.slice(1)
          );
      }
    })();

    // seo data
    const TITLE = `${props.data.town} in ${SERVICE} - WhereIsTheGoogleCar`;
    const DESCRIPTION = `${SERVICE} Car in ${props.data.town} on ${dateFormatted}.`;

    const OG_IMG_ENCODED = encodeURIComponent(props.data.imageUrl);
    const OG_IMG_OPTIMIZED = encodeURIComponent(
      `${env.NEXT_PUBLIC_VERCEL_URL}/_next/image?url=${OG_IMG_ENCODED}&w=1920&q=75`,
    );
    const OPENGRAPH_IMAGE = `${env.NEXT_PUBLIC_VERCEL_URL}/api/og?img=${OG_IMG_OPTIMIZED}`;

    return (
      <>
        <NextSeo
          title={TITLE}
          description={DESCRIPTION}
          openGraph={{
            type: "website",
            title: TITLE,
            description: DESCRIPTION,
            images: [
              {
                url: OPENGRAPH_IMAGE,
                width: 1200,
                height: 630,
                alt: TITLE,
              },
            ],
            site_name: "Where Is The Google Car",
          }}
        />

        <div>
          <PageComponent dateFormatted={dateFormatted} data={props.data} />
        </div>
      </>
    );
  }
}

export const getStaticPaths = async () => {
  // fallback: 'blocking' will generate not-yet-generated pages on-demand
  return {
    fallback: "blocking",
    paths: [], // Add an empty array as the value for paths
  };
};

export const getStaticProps = async ({
  params,
}: {
  params: { id: string };
}) => {
  // create trpc caller
  const caller = appRouter.createCaller({
    db,
  });

  // get id from query
  const id_query = params.id;
  if (id_query) {
    const id = id_query.toString();

    try {
      const getById = await caller.query.getById({ id });

      if (getById && typeof getById === "object") {
        const data: IData = {
          ...(getById as IData),
        };

        // add CDN url to imageUrl (location)
        data.imageUrl = `${env.NEXT_PUBLIC_CDN_URL}/${data.imageUrl}`;

        return {
          props: {
            data,
          },
          revalidate: 60,
        };
      }
    } catch (error) {
      return {
        notFound: true,
      };
    }
  }
};
