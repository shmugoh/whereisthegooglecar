import React from "react";
import { type InferGetServerSidePropsType } from "next/types";
import Error from "next/error";

import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import { PageComponent } from "~/components/layout/entry/page";

// TODO: add seo metadata

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  if (!props.data) {
    return <Error statusCode={404} />;
  }

  if (props.data) {
    const date = new Date(props.data.date);
    const dateFormatted = date.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
      day: "numeric",
    });
    return <PageComponent dateFormatted={dateFormatted} data={props.data} />;
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
    const getById = await caller.post.getById({ id });

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

      return {
        props: {
          data,
        },
      };
    }
  }

  return {
    props: {
      data: null,
    },
  };
};
