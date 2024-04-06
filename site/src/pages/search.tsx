import React, { useCallback, useState, useEffect, useRef } from "react";
import { api } from "~/utils/api";
import { BaseEntriesPage } from "~/components/layout/entry/entries";
import { useRouter } from "next/router";
import Error from "~/pages/_error";

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

export default function Search() {
  // router & error settings
  const router = useRouter();

  // query configuration
  const query = router.query as SearchProps;
  const { town, date, services, countries } = query;

  const [errorCode, setErrorCode] = useState(200);
  const [errorMessage, setErrorMessage] = useState("");

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

  const months = useRef<Date[] | [Date, Date][]>([]);
  const monthIndex = useRef(0);

  // initiates by grabbing all available months from query
  const grabMonths = useCallback(async () => {
    setContinueFetching(true); // in case if it has been set to disabled in the same mount

    // if input are same month and year
    if (
      startDate.current.getUTCMonth() === finalDate.current.getUTCMonth() &&
      startDate.current.getUTCFullYear() === finalDate.current.getUTCFullYear()
    ) {
      months.current = [[startDate.current, finalDate.current]];
      return;
    }

    // if inputs are different
    try {
      const data = await monthMutation.mutateAsync({
        startDate: startDate.current,
        endDate: finalDate.current,
        company: services!,
        town: town!,
        country: countries!,
      });
      months.current = data;
      setErrorCode(200); // re-alives the site if previous call was an error

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      setErrorCode(error.data?.httpStatus ?? 500);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      setErrorMessage(error.message ?? undefined);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return error;
    }
  }, [monthMutation, startDate, finalDate, services, town, countries]);

  // fetch data
  const isMounted = useRef(true);
  const fetchData = useCallback(async () => {
    // in the event that index has been finished and months is not empty
    if (
      monthIndex.current == months.current.length &&
      monthIndex.current != 0 &&
      months.current.length != 0
    ) {
      // console.log("unmounting in fetchData");
      isMounted.current = false;
      setContinueFetching(false);
    }

    // if component is not mounted and months has no data
    if (!isMounted.current || monthIndex.current >= months.current.length) {
      return;
    }

    // if component is mounted and months has data, begin indexing
    let currentDate: Date;

    // in the event that startDate and finalDate have the same month & year
    if (Array.isArray(months.current[0]) && months.current[0].length === 2) {
      // console.log("same month and year on input and output");
      const currentDate: [Date, Date] | undefined = months.current[0] as [
        Date,
        Date,
      ];
      currentStartDate.current = currentDate[0];
      currentEndDate.current = currentDate[1];
      setContinueFetching(false);
      monthIndex.current++; // Add this line to increment the monthIndex
      // in the event that current index is either on first/last month to query, grab day
    } else if (
      monthIndex.current === 0 &&
      months.current[monthIndex.current].getUTCMonth() ===
        finalDate.current.getUTCMonth() &&
      months.current[monthIndex.current].getUTCFullYear() ===
        finalDate.current.getUTCFullYear()
      // last date picked on input; crawl from first day up until selected day
    ) {
      // console.log("on last month...");
      currentDate = finalDate.current;

      currentStartDate.current = new Date(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        1,
      );
      currentEndDate.current = new Date(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate(),
      );
      // first date picked on input; crawl from selected day up until last day of month
    } else if (
      monthIndex.current === months.current.length - 1 &&
      months.current[monthIndex.current].getUTCMonth() ===
        startDate.current.getUTCMonth() &&
      months.current[monthIndex.current].getUTCFullYear() ===
        startDate.current.getUTCFullYear()
    ) {
      // console.log("on start month...");
      currentDate = startDate.current;

      currentStartDate.current = new Date(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate(),
      );

      currentEndDate.current = new Date(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth() + 1,
        0,
      );
      // if none apply, index as normal
    } else {
      // console.log("index as normal...");
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
    }

    const getMonth = currentStartDate.current.getUTCMonth().toString();
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
      console.log("attempting to refetch data");
      void fetchData();
      // console.log(error);
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
      if (!router.isReady) return;
      setCardSets([]);
      setPage(1);
      monthIndex.current = 0;
      months.current = [];
      void initDate(date);
      void grabMonths();
    };

    isMounted.current = true;
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      isMounted.current = false;
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.asPath, router.isReady]);

  // grabs months once queries are set
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (town || date || services || countries) {
      isMounted.current = true;
      initDate(query.date);
      void grabMonths();
    }

    return () => {
      // console.log("unmounting in useEffect(None)");
      isMounted.current = false;
      setCardSets([]);
      setPage(1);
    };
  }, [town, date, services, countries]);

  // begin querying once available months are set
  useEffect(() => {
    if (months.current) {
      void fetchData();
    }
  }, [months.current]);

  return errorCode !== 200 ? (
    <Error statusCode={errorCode} message={errorMessage} />
  ) : (
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
