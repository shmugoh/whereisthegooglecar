import React, { useCallback, useState, useEffect, useRef } from "react";
import { api } from "~/utils/api";
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
  const startDate = useRef(new Date());
  const finalDate = useRef(new Date());
  /// buffers
  const currentStartDate = useRef(new Date());
  const currentEndDate = useRef(new Date());
  const initDate = useCallback((date: string) => {
    if (date) {
      type DateObject = {
        from: string;
        to: string;
      };
      const dateObject = JSON.parse(date) as DateObject;
      startDate.current = new Date(dateObject.from);
      finalDate.current = new Date(dateObject.to);

      currentStartDate.current = new Date(startDate.current);
      currentEndDate.current = new Date(finalDate.current);
    }
  }, []);

  // infinite scroll
  const [page, setPage] = useState(1);
  const [cardSets, setCardSets] = useState([]);
  const [continueFetching, setContinueFetching] = useState(true);

  // fetch data
  const dataMutation = api.query.queryByFilter.useMutation({});
  const monthMutation = api.query.queryByFilterMonth.useMutation({});

  const months = useRef<Date[]>([]);
  const monthIndex = useRef(0);

  // grabs all available months from query
  const grabMonths = useCallback(async () => {
    const data = await monthMutation.mutateAsync({
      startDate: startDate.current,
      endDate: finalDate.current,
      company: services!,
      town: town!,
      country: countries!,
    });
    months.current = data;
  }, [monthMutation, startDate, finalDate, services, town, countries]);

  // fetch data
  const isMounted = useRef(true);
  const fetchData = useCallback(async () => {
    // in the event that it is full and months is not empty
    if (
      monthIndex.current == months.current.length &&
      monthIndex.current != 0 &&
      months.current.length != 0
    ) {
      isMounted.current = false;
      setContinueFetching(false);
    }

    // if component is not mounted and months has no data
    if (!isMounted.current || monthIndex.current >= months.current.length) {
      return;
    }

    // if component is mounted and months has data, begin indexing
    const currentDate = months.current[monthIndex.current];
    currentStartDate.current = new Date(
      currentDate!.getUTCFullYear(),
      currentDate!.getUTCMonth(),
      1,
    );
    currentEndDate.current = new Date(
      currentDate!.getUTCFullYear(),
      currentDate!.getUTCMonth() + 1,
      0,
    );

    const getMonth = (currentStartDate.current.getMonth() + 1).toString();
    const getYear = currentStartDate.current.getFullYear().toString();

    // query data from indexed month
    try {
      const data = await dataMutation.mutateAsync({
        company: services!,
        startDate: currentStartDate.current,
        endDate: currentEndDate.current,
        town: town!,
        country: countries!,
      });

      if (data) {
        // add to page
        setCardSets((prevCardSets) => [
          ...prevCardSets,
          {
            data: data,
            month: getMonth,
            year: getYear,
          },
        ]);
        setPage((prevPage) => prevPage + 1);

        // upper the index
        monthIndex.current++;
      }
    } catch (error) {
      console.log(error);
      // void fetchData();
      return;
    }
  }, [dataMutation, services, town, countries]);

  // fetch new data if there are less than 6 entries
  useEffect(() => {
    if (
      cardSets.length === 1 &&
      cardSets[0]?.data?.length < 6 &&
      window.innerWidth >= 1024 && // only for desktop
      monthIndex.current === 1
    ) {
      isMounted.current = true;
      void fetchData();
    }
  }, [cardSets]);

  // re-fetch new data if route chanegs
  // aka, when new data is given from saearch component
  useEffect(() => {
    const handleRouteChange = () => {
      setCardSets([]);
      setPage(1);
      monthIndex.current = 0;
      months.current.length = 0;
      void grabMonths();
    };

    isMounted.current = true;
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      console.log("unmounting in routeChangeComplete");
      isMounted.current = false;
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.asPath]);

  // grabs months once component mounts
  useEffect(() => {
    isMounted.current = true;
    void initDate(date);
    void grabMonths();
    return () => {
      console.log("unmounting in useEffect(None)");
      isMounted.current = false;
      setCardSets([]);
      setPage(1);
    };
  }, []);

  // begin querying once available months are set
  useEffect(() => {
    if (months.current) {
      void fetchData();
    }
  }, [months.current]);

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
