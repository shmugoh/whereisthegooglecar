/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { InferGetServerSidePropsType } from "next";
import EntriesPage from "~/components/layout/entry/entries";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";

const COMPANY = "google";
const MAX_YEAR = 2006;
const SHOW_COMPANY = false;

export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const months = JSON.parse(props.months);
  const entries = JSON.parse(props.entries);
  const index = props.index;

  return (
    <EntriesPage
      months={months}
      entries={entries}
      index={index}
      showCompany={SHOW_COMPANY}
    />
  );
}

export const getServerSideProps = async ({ query }) => {
  const caller = appRouter.createCaller({ db });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
  const index = parseInt(query.page ?? 1);

  const months = await caller.query.queryByFilterMonth({
    company: COMPANY,
    startDate: new Date(MAX_YEAR, 0),
    endDate: new Date(),
  });

  const month = months[index - 1];

  const entries = await caller.query.queryByMonth({
    company: COMPANY,
    month: (month.getUTCMonth() + 1).toString(),
    year: month.getUTCFullYear().toString(),
  });

  return {
    props: {
      entries: JSON.stringify(entries),
      months: JSON.stringify(months),
      index: index,
    },
    // revalidate: 10,
  };
};
