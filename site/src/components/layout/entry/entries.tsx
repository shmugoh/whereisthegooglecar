import { api } from "~/utils/api";
import { CardSet } from "~/components/layout/entry/card";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect, useRef, useCallback } from "react";
import { HomeSkeleton } from "~/components/layout/entry/skeleton";

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
  const lastMonth = useRef("");
  const tries = useRef(0);

  // infinite scroll
  const [page, setPage] = useState(1);
  const [cardSets, setCardSets] = useState([]);
  const [continueFetching, setContinueFetching] = useState(true);

  // fetch data
  const dataMutation = api.query.queryByMonth.useMutation({});

  const updateDate = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
  };

  // using usecallback to ensure that the function is not re-created
  // and permanently remains the same
  // in other words... to keep fetching data
  const fetchData = useCallback(async () => {
    updateDate();

    const getMonth = (currentDate.getMonth() + 1).toString();
    const getYear = currentDate.getFullYear().toString();

    // stop fetching if the year is less than the maximum year
    if (props.maxYear && props.maxYear > Number(getYear)) {
      setContinueFetching(false);
      return;
    }

    try {
      const data = await dataMutation.mutateAsync({
        company: props.company,
        month: getMonth,
        year: getYear,
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
  }, []);

  // fetch data on mount/start
  useEffect(() => {
    void fetchData();
  }, []);

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

  return (
    <BaseEntriesPage
      {...{
        cardSets,
        fetchData,
        continueFetching,
        showCompany: props.showCompany,
      }}
    />
  );
}
