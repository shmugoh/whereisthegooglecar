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
  showCompany?: boolean;
  months: never[];
  entries: never[];
  index: number;
};

type BaseEntriesPageProps = {
  cardSets: never[];
  fetchData: () => void;
  continueFetching: boolean;
  showCompany?: boolean;
};

export default function EntriesPage(props: EntriesPageProps) {
  // states & references
  // const [cardSets, setCardSets] = useState([]);
  // setCardSets(props.entries);

  // const [error, setError] = useState(200);
  // if (error !== 200) {
  //   console.log("hello bro");
  //   return <Error statusCode={error} />;
  // }

  return (
    <div className="flex w-full flex-col justify-between gap-4 md:min-h-[730px]">
      <div className="justify-start">
        <PageNavigation
          length={props.months.length}
          activeIndex={props.index}
        />
        <MobilePageNavigation
          length={props.months.length}
          activeIndex={props.index}
        />
      </div>

      <div className="justify-center">
        <CardSet
          month={2}
          year={"2024"}
          info={props.entries}
          showCompany={props.showCompany}
        />
      </div>

      <div className="justify-end">
        <PageNavigation
          length={props.months.length}
          activeIndex={props.index}
        />
        <MobilePageNavigation
          length={props.months.length}
          activeIndex={props.index}
        />
      </div>
    </div>
  );
}

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
