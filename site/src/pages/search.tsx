import React, { useCallback, useState, useEffect, useRef } from "react";
import { api } from "~/utils/api";
import { BaseEntriesPage } from "~/components/layout/entry/entries";
import { useRouter } from "next/router";
import Error from "~/pages/_error";

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
  const [errorCode, setErrorCode] = useState(200);
  const [errorMessage, setErrorMessage] = useState("");

  // states and references
  const [cardSets, setCardSets] = useState([]);
  const months = useRef<Date[]>([]);
  const month = useRef<Date>(new Date());
  const monthIndex = useRef(0);

  // initialize date
  const startDate = useRef<Date>(new Date());
  const finalDate = useRef<Date>(new Date());
  const currentStartDate = useRef<Date>(new Date());
  const currentEndDate = useRef<Date>(new Date());

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

  // fetch data
  const dataMutation = api.query.queryByFilter.useMutation({});
  const monthMutation = api.query.queryByFilterMonth.useMutation({});

  const fetchData = useCallback(async () => {
    setCardSets([]); // clear current data

    const data = await dataMutation.mutateAsync({
      company: services!,
      startDate: currentStartDate.current,
      endDate: currentEndDate.current,
      town: town!,
      country: countries!,
    });

    setCardSets(data as never[]); // set new data
  }, []);

  const grabMonths = useCallback(async () => {
    const data = await monthMutation.mutateAsync({
      company: services!,
      startDate: new Date(currentStartDate.current),
      endDate: currentEndDate.current,
      town: town!,
      country: countries!,
    });

    months.current = data;
  }, []);

  // re-fetch new data if route chanegs
  // aka, when new data is given from saearch component

  // grabs months once queries are set
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (town || date || services || countries) {
      // isMounted.current = true;
      initDate(query.date);
      void grabMonths();
      void fetchData();
    }

    return () => {
      // console.log("unmounting in useEffect(None)");
      // isMounted.current = false;
      setCardSets([]);
    };
  }, [town, date, services, countries]);

  return errorCode !== 200 ? (
    <Error statusCode={errorCode} message={errorMessage} />
  ) : (
    <BaseEntriesPage
      months={months}
      month={month}
      activeIndex={monthIndex}
      cardSets={cardSets}
      showCompany={true}
    />
  );
}
