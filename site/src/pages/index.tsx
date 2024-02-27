import { api } from "~/utils/api";
import { CardSet } from "~/components/layout/entry/card";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect, useRef } from "react";
import { HomeSkeleton } from "~/components/layout/entry/skeleton";

export default function Home({}) {
  // set dates
  const currentDate = new Date();
  const [monthsBack, setMonthsBack] = useState(0);
  let getMonth = (currentDate.getMonth() + 1).toString();
  let getYear = currentDate.getFullYear().toString();

  const lastMonth = useRef("");
  const tries = useRef(0);

  // infinite scroll
  const [page, setPage] = useState(1);
  const [cardSets, setCardSets] = useState([{ data: [], month: "", year: "" }]);

  // fetch data
  const dataMutation = api.post.queryByFilter.useMutation({
    onSuccess(data) {
      // sets data to the mutation
      dataMutation.data = data;
      dataMutation.isSuccess = true;
    },
  });

  const fetchData = async () => {
    // set dates for query
    setMonthsBack(monthsBack + 1);
    currentDate.setMonth(currentDate.getMonth() - monthsBack);
    getMonth = (currentDate.getMonth() + 1).toString();
    getYear = currentDate.getFullYear().toString();

    dataMutation.mutate({
      company: "google",
      month: getMonth.toString(),
      year: getYear,
    });

    console.log(
      `Sending: ${getMonth.toString()}, ${lastMonth.current} - ${getYear}`,
    );
  };

  useEffect(() => {
    console.log(
      `Received: ${lastMonth.current} - ${getYear}, ${getMonth.toString()}`,
    );

    if (dataMutation.data) {
      if (dataMutation.data.length === 0) {
        void fetchData();
        tries.current++;
        return;
      }

      if (dataMutation.data.length > 0) {
        console.log("Found Data!");
        console.log(dataMutation.data);
      }

      // using this as a way to stop an infinite loop
      // of the same month being spawned
      if (lastMonth.current !== getMonth.toString() || tries.current != 0) {
        // append to cardSets
        setCardSets([
          ...cardSets,
          {
            data: dataMutation.data,
            month: getMonth.toString(),
            year: getYear,
          },
        ]);
        // increment page
        setPage(page + 1);
      }

      lastMonth.current = getMonth.toString();
      tries.current = 0;
    }
  }, [dataMutation]);

  // fetch data on mount/start
  useEffect(() => {
    void fetchData();
  }, []);

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
