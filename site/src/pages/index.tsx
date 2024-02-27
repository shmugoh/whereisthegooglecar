import { api } from "~/utils/api";
import { CardSet } from "~/components/layout/entry/card";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect } from "react";

export default function Home({}) {
  // set dates
  const currentDate = new Date();
  const [monthsBack, setMonthsBack] = useState(0);
  const getMonth = currentDate.getMonth() + 1;
  const getYear = currentDate.getFullYear().toString();

  // infinite scroll
  const [page, setPage] = useState(1);
  const [cardSets, setCardSets] = useState([{ data: [], month: "", year: "" }]);

  // fetch data
  const [data, setData] = useState({});
  const dataMutation = api.post.queryByFilter.useMutation({
    onSuccess(data) {
      setData(data);
      console.log(data);
    },
  });

  const fetchData = async () => {
    // set dates for query
    setMonthsBack(monthsBack + 1);
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - monthsBack);
    const getMonth = (currentDate.getMonth() + 1).toString();
    const getYear = currentDate.getFullYear().toString();

    dataMutation.mutate({
      company: "google",
      month: getMonth.toString(),
      year: getYear,
    });

    // append to cardSets
    setCardSets([
      ...cardSets,
      { data: dataMutation, month: getMonth.toString(), year: getYear },
    ]);
    // increment page
    setPage(page + 1);
  };

  // fetch data on mount/start
  useEffect(() => {
    void fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <InfiniteScroll
        dataLength={cardSets.length}
        next={fetchData}
        hasMore={true}
        loader={<div>Loading...</div>}
      >
        {cardSets.map((data, index) => (
          <CardSet
            key={index}
            month={new Date(0, Number(data.month) - 1).toLocaleString(
              "default",
              {
                month: "long",
              },
            )}
            year={data.year}
            info={data.data}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
}
