import { api } from "~/utils/api";
import { CardSet } from "~/components/layout/entry/card";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect, useRef, useCallback } from "react";
import { HomeSkeleton } from "~/components/layout/entry/skeleton";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { PageNavigation } from "./pagination";

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
          month={new Date(0, Number(data.month) - 1).toLocaleString("default", {
            month: "long",
          })}
          year={data.year}
          info={data.data}
          showCompany={props.showCompany}
        />
      ))}
    </InfiniteScroll>
  );
}

export default function EntriesPage(props: EntriesPageProps) {
  // date configuration
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + 1);
  // summing new month so during first-run, it fetches the current month

  // re-run tracking
  const months = useRef<Date[]>([]);
  const month = useRef<Date>(new Date());
  const tries = useRef(0);

  // infinite scroll
  const [cardSets, setCardSets] = useState([]);

  // fetch data
  const dataMutation = api.query.queryByMonth.useMutation({});
  const monthMutation = api.query.queryByFilterMonth.useMutation({});

  const fetchData = useCallback(async () => {
    const data = await dataMutation.mutateAsync({
      company: props.company,
      month: (month.current.getMonth() + 1).toString(),
      year: month.current.getFullYear().toString(),
    });

    setCardSets(data as never[]);
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

  useEffect(() => {
    if (months.current.length === 0) {
      return;
    }

    if (months.current[0]) {
      month.current = months.current[0];
    }

    void fetchData();
  }, [months.current]);

  return (
    <>
      <CardSet
        month={month.current.toLocaleString("default", { month: "long" })}
        year={month.current.getFullYear().toString()}
        info={cardSets}
        showCompany={props.showCompany}
      />

      <PageNavigation length={months.current.length} activeIndex={1} />
    </>
  );
}
