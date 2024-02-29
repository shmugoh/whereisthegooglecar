import React from "react";
import { type InferGetServerSidePropsType } from "next/types";
import Error from "next/error";

import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import { PageComponent } from "~/components/layout/entry/page";
import Head from "next/head";

import { env } from "~/env";

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  if (props.data) {
    // format date
    const date = new Date(props.data.date);
    const dateFormatted = date.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
      day: "numeric",
    });

    // seo data
    const TITLE = `${props.data.town} in Google Street View - WhereIsTheGoogleCar`;
    const DESCRIPTION = `Google Street View Car in ${props.data.town} on ${dateFormatted}.`;
    const KEYWORDS = `google street view, ${props.data.town}, ${props.data.country}, google car, google maps, google, street view, google street view car, google maps car`;

    return (
      <>
        <Head>
          <title>{TITLE}</title>
          <meta property="og:title" content={TITLE} />
          <meta property="twitter:title" content={TITLE}></meta>

          <meta name="description" content={DESCRIPTION} />
          <meta property="og:description" content={DESCRIPTION} />

          <meta name="keywords" content={KEYWORDS} />

          <meta
            property="og:image"
            content={`${env.NEXT_PUBLIC_VERCEL_URL}/api/og?img=${encodeURIComponent(props.data.imageUrl)}`}
          />
        </Head>
        <div>
          <PageComponent dateFormatted={dateFormatted} data={props.data} />
        </div>
      </>
    );
  }
}

export const getServerSideProps = async ({
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
    // parse id to number
    const id = parseInt(id_query);

    // get data from api
    // eslint-disable-next-line prefer-const

    try {
      const getById = await caller.query.getById({ id });

      // fix JSON serialization issues
      // ...and return data
      if (getById) {
        // TODO: pass getById's type over
        const data: {
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
        } = { ...getById };

        // JSON return serialization errors as
        // the below values are "not serializable"
        // (date && bigint)
        data.date = getById.date.toISOString();
        data.createdAt = getById.createdAt.toISOString();
        data.updatedAt = getById.updatedAt.toISOString();
        data.message_id = String(getById.message_id);
        data.channel_id = String(getById.channel_id);

        // add CDN url to imageUrl (location)
        data.imageUrl = `${env.NEXT_PUBLIC_CDN_URL}/${data.imageUrl}`;

        return {
          props: {
            data,
          },
        };
      }
    } catch (error) {
      return {
        notFound: true,
      };
    }
  }
};
