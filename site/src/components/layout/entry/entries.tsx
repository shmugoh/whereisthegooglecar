import { api } from "~/utils/api";
import { CardSet } from "~/components/layout/entry/card";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect, useRef, useCallback } from "react";
import { HomeSkeleton } from "~/components/layout/entry/skeleton";
import {
  PageNavigation,
  MobilePageNavigation,
} from "~/components/layout/pagination";
import { useRouter } from "next/router";
import Error from "~/pages/_error";

type EntriesPageProps = {
  company: string;
  showCompany?: boolean;
  maxYear?: number;
};

type BaseEntriesPageProps = {
  cardSets: never[];
  fetchData: () => void;
  continueFetching: boolean;
  showCompany?: boolean;
};

export function BaseEntriesPage(props: BaseEntriesPageProps) {
  return (
    <InfiniteScroll
      dataLength={props.cardSets.length}
      next={props.fetchData}
      hasMore={props.continueFetching}
      className="flex w-full flex-col items-center gap-4"
      loader={<HomeSkeleton />}
    >
      {props.cardSets.map((data, index) => (
        <CardSet
          key={index}
          month={data.month}
          year={data.year}
          info={data.data}
          showCompany={props.showCompany}
        />
      ))}
    </InfiniteScroll>
  );
}

export default function EntriesPage(props: EntriesPageProps) {
  const router = useRouter();

  // date configuration
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + 1);
  // summing new month so during first-run, it fetches the current month

  // states & references
  const [cardSets, setCardSets] = useState([]);
  const months = useRef<Date[]>([]);
  const month = useRef<Date>(new Date());
  const activeIndex = useRef<number>(1);

  const [error, setError] = useState(200);

  // fetch data
  const dataMutation = api.query.queryByMonth.useMutation({});
  const monthMutation = api.query.queryByFilterMonth.useMutation({});

  const fetchData = useCallback(async () => {
    setCardSets([]); // clear current data

    const data = await dataMutation.mutateAsync({
      company: props.company,
      month: (month.current.getUTCMonth() + 1).toString(),
      year: month.current.getUTCFullYear().toString(),
    });

    setCardSets(data as never[]); // set new data
  }, []);

  const grabMonths = useCallback(async () => {
    const data = await monthMutation.mutateAsync({
      startDate: new Date(props.maxYear ?? 2006, 0),
      endDate: currentDate,
      company: props.company,
    });

    months.current = data;
  }, []);
  useEffect(() => {
    void grabMonths();
  }, []);

  // fetch data on mount
  useEffect(() => {
    if (months.current.length === 0) {
      return;
    }
    if (months.current[0]) {
      month.current = months.current[0];
    }

    void fetchData();
  }, [months.current]);

  // fetch new data on new query
  useEffect(() => {
    if (router.query.page === undefined || months.current.length === 0) {
      return;
    } else {
      // checks if query is within range
      if (
        Number(router.query.page) > months.current.length ||
        Number(router.query.page) < 1
      ) {
        setError(404);
        return;
      }

      activeIndex.current = Number(router.query.page);
      month.current = months.current[Number(router.query.page) - 1];

      setCardSets([]);
      void fetchData();
    }
  }, [router.query.page, months.current]);

  if (error !== 200) {
    console.log("hello bro");
    return <Error statusCode={error} />;
  }

  return (
    <div className="flex w-full flex-col justify-between gap-4 md:min-h-[730px]">
      <div className="justify-start">
        <PageNavigation
          length={months.current.length}
          activeIndex={activeIndex.current}
        />
        <MobilePageNavigation
          length={months.current.length}
          activeIndex={activeIndex.current}
        />
      </div>

      <div className="justify-center">
        <CardSet
          month={month.current.getUTCMonth()}
          year={month.current.getUTCFullYear().toString()}
          info={cardSets}
          showCompany={props.showCompany}
        />
      </div>

      <div className="justify-end">
        <PageNavigation
          length={months.current.length}
          activeIndex={activeIndex.current}
        />
        <MobilePageNavigation
          length={months.current.length}
          activeIndex={activeIndex.current}
        />
      </div>
    </div>
  );
}
