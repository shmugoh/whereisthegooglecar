import React, { useCallback, useState, useEffect, useRef } from "react";
import { api } from "~/utils/api";
import { updateDate } from "~/utils/date";
import { BaseEntriesPage } from "~/components/layout/entry/entries";
import { useRouter } from "next/router";

import type { GetServerSidePropsContext } from "next";

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

export default function Search({
  town,
  date,
  services,
  countries,
}: SearchProps) {
  const router = useRouter();

  // date configuration
  let startDate: Date;
  let finalDate: Date;

  const currentStartDate = useRef(new Date());
  const currentEndDate = useRef(new Date());

  const initDate = (date: string) => {
    if (date) {
      type DateObject = {
        from: string;
        to: string;
      };
      const dateObject = JSON.parse(date) as DateObject;
      startDate = new Date(dateObject.from);
      finalDate = new Date(dateObject.to);

      currentStartDate.current = new Date(startDate);
      currentEndDate.current = new Date(finalDate);
    }
  };

  const lastMonth = useRef("");
  const tries = useRef(0);

  // infinite scroll
  const [page, setPage] = useState(1);
  const [cardSets, setCardSets] = useState([]);
  const [continueFetching, setContinueFetching] = useState(true);

  // fetch data
  const dataMutation = api.query.queryByFilter.useMutation({});

  // using usecallback to ensure that the function is not re-created
  // and permanently remains the same
  // in other words... to keep fetching data
  const fetchData = useCallback(async () => {
    const { currentStartDate: newStartDate, currentEndDate: newEndDate } =
      updateDate({
        startDate,
        finalDate,
        currentStartDate: currentStartDate.current,
        currentEndDate: currentEndDate.current,
        setContinueFetching,
      });

    currentStartDate.current = newStartDate;
    currentEndDate.current = newEndDate;

    const getMonth = (currentStartDate.current.getMonth() + 1).toString();
    const getYear = currentStartDate.current.getFullYear().toString();

    // stop fetching if the year is less than the maximum year
    if (!setContinueFetching) {
      // update date already tells when to stop fetching
      return;
    }

    try {
      const data = await dataMutation.mutateAsync({
        company: services!,
        startDate: currentStartDate.current,
        endDate: currentEndDate.current,
        town: town!,
        country: countries!,
      });

      if (data) {
        // using this as a way to stop an infinite loop
        // of the same month being spawned
        if (lastMonth.current !== getMonth || tries.current != 0) {
          // append to cardSets
          setCardSets((prevCardSets) => [
            ...prevCardSets,
            {
              data: data,
              month: getMonth,
              year: getYear,
            },
          ]);
          // increment page
          setPage((prevPage) => prevPage + 1);
        }

        lastMonth.current = getMonth;
        tries.current = 0;
      }
    } catch (error) {
      // re-run if no data is found
      void fetchData();
      tries.current++;
      return;
    }
  }, [services, town, countries]);

  // fetch data when query is ready
  useEffect(() => {
    void initDate(date);
    void fetchData();
  }, [date, services, town, countries]);

  // add more data if first fetched data has less than 6
  // to ensure that scrolling works in higher resolutions
  // ...might have to use other iterations as well
  useEffect(() => {
    if (
      cardSets.length === 1 &&
      cardSets[0]?.data?.length < 6 &&
      window.innerWidth >= 1024 // only for desktop
    ) {
      void fetchData();
    }
  }, [cardSets]);

  // re-fetch new data if route chanegs
  // aka, when new data is given from saearch component
  useEffect(() => {
    const handleRouteChange = () => {
      setCardSets([]);
      setPage(1);
      void fetchData();
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <BaseEntriesPage
      {...{
        cardSets,
        fetchData,
        continueFetching,
        showCompany: true,
      }}
    />
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { town, date, services, countries } = context.query;

  return {
    props: {
      town,
      date,
      services,
      countries,
    },
  };
};
