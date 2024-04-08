import React, { useCallback, useState, useEffect, useRef } from "react";
import { api } from "~/utils/api";
import EntriesPage from "~/components/layout/entry/entries";
import { useRouter } from "next/router";
import { HomeSkeleton } from "~/components/layout/entry/skeleton";

type SearchProps = {
  town?: string;
  date: string;
  services?: string;
  countries?: string;
};

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

export default function Search() {
  // router & query settings
  const router = useRouter();
  const query = router.query as SearchProps;
  const { town, date, services, countries } = query;
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // initialize date
  // i decided to remove date picking off, as i
  // consider pagination to be much easier on switching
  // between months/years... and it wasn't properly implemented
  // maybe for next time
  const grabFirstDate = api.grab.grabFirstDate.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  }).data;
  const startDate = new Date(grabFirstDate?.date ?? new Date(2004, 0));
  const endDate = new Date();

  // fetch/refetch data once queries are set/changed
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (town || date || services || countries) {
      setIsLoading(true);

      // without setting a timeout, the current
      // entriespage won't be cleared
      setTimeout(() => {
        setIsReady(true);
        setIsLoading(false);
      }, 1);
    }
  }, [town, date, services, countries]);

  if (isLoading ?? !isReady) {
    return <HomeSkeleton />;
  }

  return (
    <EntriesPage
      company={services}
      country={countries}
      town={town}
      startDate={startDate}
      endDate={endDate}
      showCompany={true}
    />
  );
}
