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
  const startDate = useRef<Date>(new Date());
  const endDate = useRef<Date>(new Date());
  const initDate = useCallback((date: string) => {
    if (date) {
      type DateObject = {
        from: string;
        to: string;
      };
      const dateObject = JSON.parse(date) as DateObject;
      startDate.current = new Date(dateObject.from);
      endDate.current = new Date(dateObject.to);
    }
  }, []);

  // fetch/refetch data once queries are set/changed
  useEffect(() => {
    if (town ?? date ?? services ?? countries) {
      console.log("new queries!");
      setIsLoading(true);

      // without setting a timeout, the current
      // entriespage won't be cleared
      setTimeout(() => {
        initDate(query.date);
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
      startDate={startDate.current}
      endDate={endDate.current}
      showCompany={true}
    />
  );
}
