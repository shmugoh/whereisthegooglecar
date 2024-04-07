import type { InferGetServerSidePropsType } from "next";
import EntriesPage from "~/components/layout/entry/entries";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";

const MAX_YEAR = 2006;

export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  console.log("Client: ", props.months, props.entries);

  return <EntriesPage company="google" showCompany={false} maxYear={2004} />;
}

export const getServerSideProps = async ({}) => {
  const caller = appRouter.createCaller({ db });

  const months = await caller.query.queryByFilterMonth({
    company: "google",
    startDate: new Date(MAX_YEAR, 0),
    endDate: new Date(),
  });

  const entries = await caller.query.queryByMonth({
    company: "google",
    month: (months[0].getUTCMonth() + 1).toString(),
    year: months[0].getUTCFullYear().toString(),
  });

  return {
    props: { entries: JSON.stringify(entries), months: JSON.stringify(months) },
    // revalidate: 10,
  };
};
