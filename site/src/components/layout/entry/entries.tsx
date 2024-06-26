import { api } from "~/utils/api";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type MutableRefObject,
} from "react";

import { CardSet } from "~/components/layout/entry/card";
import {
  PageNavigation,
  MobilePageNavigation,
} from "~/components/layout/pagination";
import { HomeSkeleton } from "~/components/layout/entry/skeleton";

import { useRouter } from "next/router";
import Error from "~/pages/_error";

type EntriesPageProps = {
  company: string | undefined;
  country?: string | undefined;
  town?: string | undefined;
  startDate?: Date;
  endDate?: Date;
  showCompany?: boolean;
  maxYear?: number;
};

type BaseEntriesPageProps = {
  months: MutableRefObject<{ date: Date; count: number }[]>;
  month: MutableRefObject<Date>;
  activeIndex: MutableRefObject<number>;
  cardSets: never[];
  showCompany: boolean;

  continueFetching: boolean;
  fetchData: () => Promise<void>;
};

export function BaseEntriesPage(props: BaseEntriesPageProps) {
  return (
    <div className="flex w-full flex-col justify-between gap-4 md:min-h-[730px]">
      <div className="justify-start">
        <PageNavigation
          length={props.months.current.length}
          activeIndex={props.activeIndex.current}
        />
        <MobilePageNavigation
          length={props.months.current.length}
          activeIndex={props.activeIndex.current}
        />
      </div>

      <InfiniteScroll
        className="justify-center"
        dataLength={props.cardSets.length}
        next={props.fetchData}
        hasMore={props.continueFetching}
        loader={null}
        scrollThreshold={0.7}
      >
        <CardSet
          month={props.month.current.getUTCMonth()}
          year={props.month.current.getUTCFullYear().toString()}
          info={props.cardSets}
          showCompany={props.showCompany}
          showSkeleton={props.continueFetching}
        />
      </InfiniteScroll>

      <div className="justify-end">
        <PageNavigation
          length={props.months.current.length}
          activeIndex={props.activeIndex.current}
        />
        <MobilePageNavigation
          length={props.months.current.length}
          activeIndex={props.activeIndex.current}
        />
      </div>
    </div>
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
  const months = useRef<{ date: Date; pages: number; count: number }[]>([]);
  const month = useRef<Date>(new Date());
  const activeIndex = useRef<number>(1);

  const [error, setError] = useState(200);

  // infinite scroll states
  const [continueFetching, setContinueFetching] = useState(false);
  const previousMonth = useRef<Date>(new Date());
  const activePage = useRef<number>(0);
  const availablePages = useRef<number>(0);

  // fetch data
  const dataMutation = api.query.queryByMonth.useMutation({});
  const monthMutation = api.query.queryByFilterMonth.useMutation({});

  const fetchData = useCallback(async () => {
    let data;

    // clear current date if date is not the same && continue fetching is false
    if (previousMonth.current !== month.current && continueFetching == false) {
      // console.log("month not the same... clearing all data!");
      setCardSets([]); // clear current data
    }

    // normal queries & search queries have the same 4 fundamental variables to query
    const commonData = {
      company: props.company!,
      month: month.current.getUTCMonth() + 1,
      year: month.current.getUTCFullYear(),
      page: activePage.current,
    };

    if (props.startDate !== undefined && props.endDate !== undefined) {
      // if coming from search
      data = await dataMutation.mutateAsync({
        ...commonData,
        town: props.town!,
        country: props.country!,
        cache: false,
      });
    } else {
      // if coming from front-page
      data = await dataMutation.mutateAsync(commonData);
    }

    // console.log("active page: ", activePage.current);
    // console.log("available pages: ", availablePages.current);

    if (
      availablePages.current > activePage.current &&
      availablePages.current !== 0
    ) {
      // console.log("not full. fetching more data!");
      setContinueFetching(true);
      previousMonth.current = month.current;
      activePage.current += 1;
    } else {
      setContinueFetching(false);
      // console.log("Full lol");
    }

    setCardSets((prevCardSets) => {
      const mergedCardSets = prevCardSets.concat(data as never[]);
      const uniqueMessageIds = new Set<string>();
      // remove duplicates and/or un-matching cards
      const result = mergedCardSets.filter(function (card) {
        // check if card date matches with month.current
        const cardDate = new Date(card.date);
        const cardMonth = cardDate.getUTCMonth();
        const cardYear = cardDate.getUTCFullYear();
        const currentMonth = month.current.getUTCMonth();
        const currentYear = month.current.getUTCFullYear();

        // remove card if month and year don't match
        if (cardMonth !== currentMonth || cardYear !== currentYear) {
          return false;
        }
        // check for unique message_id
        const message_id = card.message_id;
        return !this.has(message_id) && this.add(message_id);
      }, uniqueMessageIds);

      return result;
    });
  }, []);

  const grabMonths = useCallback(async () => {
    try {
      let data;

      // if coming from search
      if (props.startDate !== undefined && props.endDate !== undefined) {
        data = await monthMutation.mutateAsync({
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          company: props.company!,
          startDate: props.startDate,
          endDate: props.endDate,
          town: props.town!,
          country: props.country!,
        });
      } else {
        // if coming from normal
        data = await monthMutation.mutateAsync({
          startDate: new Date(props.maxYear ?? 2006, 0),
          endDate: currentDate,
          company: props.company,
          cache: true,
        });
      }

      months.current = data;
    } catch (error) {
      setError(404);
    }
  }, []);
  useEffect(() => {
    void grabMonths();
  }, []);

  // fetch new data on mount or new query
  useEffect(() => {
    // none still not defined
    if (router.query.page === undefined && months.current.length === 0) {
      return;
    }

    // set default query page if not set
    if (router.query.page === undefined && months.current.length !== 0) {
      router.query.page = "1";
    }

    if (months.current.length !== 0) {
      // checks if query is within range
      if (
        Number(router.query.page) > months.current.length ||
        Number(router.query.page) < 1
      ) {
        setError(404);
        return;
      }

      // reset all data
      activeIndex.current = Number(router.query.page);
      month.current = months.current[Number(router.query.page) - 1]?.date;
      activePage.current = 0;
      availablePages.current =
        months.current[Number(router.query.page) - 1]?.pages;

      setCardSets([]);
      void fetchData();
    }
  }, [router.query.page, months.current]);

  if (error !== 200) {
    return (
      <Error
        statusCode={error}
        message={error === 404 ? "No data found" : null}
      />
    );
  }

  return (
    <BaseEntriesPage
      months={months}
      month={month}
      activeIndex={activeIndex}
      cardSets={cardSets}
      showCompany={props.showCompany ?? false}
      continueFetching={continueFetching}
      fetchData={fetchData}
    />
  );
}
