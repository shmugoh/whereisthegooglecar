import { api } from "~/utils/api";
import { CardSet } from "~/components/layout/entry/card";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect } from "react";

export default function Home({}) {
  // dates
  const currentDate = new Date();
  const [monthsBack, setMonthsBack] = useState(0);
  const getMonth = currentDate.getMonth() + 1;
  const getYear = currentDate.getFullYear().toString();

  // infinite scroll
  const [page, setPage] = useState(1);
  const [cardSets, setCardSets] = useState([{ data: [], month: "", year: "" }]);

  // fetch data
  const { refetch } = api.post.queryByFilter.useQuery({
    company: "google",
    month: getMonth.toString(),
    year: getYear,
  });
  const fetchData = async () => {
    setMonthsBack(monthsBack + 1);
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - monthsBack);
    const getMonth = (currentDate.getMonth() + 1).toString();
    const getYear = currentDate.getFullYear().toString();

    const { data: data } = await refetch({
      company: "google",
      month: getMonth.toString(),
      year: getYear,
    });

    // append to cardSets
    setCardSets([
      ...cardSets,
      { data: data, month: getMonth.toString(), year: getYear },
    ]);
    // increment page
    setPage(page + 1);
  };

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
            month={data.month}
            year={data.year}
            info={data.data}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
}
