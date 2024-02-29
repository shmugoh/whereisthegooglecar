import { api } from "~/utils/api";
import { CardSet } from "~/components/layout/entry/card";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect, useRef, useCallback } from "react";
import { HomeSkeleton } from "~/components/layout/entry/skeleton";

export default function Home({}) {
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

  // fetch data
  const dataMutation = api.query.queryByFilter.useMutation({});

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

    try {
      const data = await dataMutation.mutateAsync({
        company: "google",
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
  // useEffect(() => {
  //   console.log("useEffect called");
  //   void fetchData();
  // }, []);

  return (
    <InfiniteScroll
      dataLength={cardSets.length}
      next={fetchData}
      hasMore={true}
      className="flex w-full flex-col items-center gap-4"
      loader={<HomeSkeleton />}
    >
      {cardSets.map((data, index) => (
        <CardSet
          key={index}
          month={new Date(0, Number(data.month) - 1).toLocaleString("default", {
            month: "long",
          })}
          year={data.year}
          info={data.data}
        />
      ))}
    </InfiniteScroll>
  );
}
