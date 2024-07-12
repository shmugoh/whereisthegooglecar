import React, { useState, useEffect } from "react";
import EntriesPage from "~/components/layout/entry/entries";
import { useRouter } from "next/router";
import { HomeSkeleton } from "~/components/layout/entry/skeleton";

type SearchProps = {
  town?: string;
  date: string;
  services?: string;
  countries?: string;
};

export default function Search() {
  // router & query settings
  const router = useRouter();
  const query = router.query as SearchProps;
  const { town, date, services, countries } = query;
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      showCompany={true}
    />
  );
}
