import InfiniteScroll from "react-infinite-scroll-component";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type MutableRefObject,
} from "react";
import { axiosInstance as axios } from "~/utils/api/swrFetcher";

import { CardSet } from "~/components/layout/entry/card";
import {
  PageNavigation,
  MobilePageNavigation,
} from "~/components/layout/pagination";

import { useRouter } from "next/router";
import Error from "~/pages/_error";
import { buildURLParams } from "~/utils/api/url_params";

type EntriesPageProps = {
  company: string | undefined;
  country?: string | undefined;
  town?: string | undefined;
  showCompany?: boolean;
  search?: boolean;
};

type BaseEntriesPageProps = {
  months: MonthList;
  activeMonth: MutableRefObject<Date>;
  activeIndex: number;
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
          length={props.months.length}
          activeIndex={props.activeIndex}
        />
        <MobilePageNavigation
          length={props.months.length}
          activeIndex={props.activeIndex}
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
          month={props.activeMonth.current.getUTCMonth()}
          year={props.activeMonth.current.getUTCFullYear().toString()}
          info={props.cardSets}
          showCompany={props.showCompany}
          showSkeleton={props.continueFetching}
        />
      </InfiniteScroll>

      <div className="justify-end">
        <PageNavigation
          length={props.months.length}
          activeIndex={props.activeIndex}
        />
        <MobilePageNavigation
          length={props.months.length}
          activeIndex={props.activeIndex}
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
  // summing new activeMonth so during first-run, it fetches the current activeMonth

  // states & references
  const [cardSets, setCardSets] = useState([]);
  const [months, setMonths] = useState<MonthList>([]);
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const [error, setError] = useState(200);
  const [continueFetching, setContinueFetching] = useState(false);

  const activeMonth = useRef<Date>(new Date());

  // infinite scroll states
  const previousMonth = useRef<Date>(new Date());
  const activePage = useRef<number>(0);
  const availablePages = useRef<number>(0);

  // fetch data
  const fetchData = useCallback(async () => {
    // clear current date if date is not the same && continue fetching is false
    if (
      previousMonth.current !== activeMonth.current &&
      continueFetching == false
    ) {
      // console.log("activeMonth not the same... clearing all data!");
      setCardSets([]); // clear current data
    }

    // normal queries & search queries have the same 4 fundamental variables to query
    const commonData: SearchInput = {
      month: activeMonth.current.getUTCMonth() + 1,
      year: activeMonth.current.getUTCFullYear(),
      page: activePage.current,
    };
    if (props.company) {
      commonData.service = props.company;
    }
    if (!props.search) {
      commonData.cache = true;
    }
    if (props.search) {
      // if coming from search
      if (props.town) {
        commonData.town = props.town;
      }
      if (props.country) {
        commonData.country = props.country;
      }
    }

    const QueryString = buildURLParams(commonData);

    const response = await axios.get<SpottingsArray>(
      `/spottings/search?${QueryString}`,
    );
    // build parameters
    const data = response.data;

    if (
      availablePages.current > activePage.current &&
      availablePages.current !== 0
    ) {
      // console.log("not full. fetching more data!");
      setContinueFetching(true);
      previousMonth.current = activeMonth.current;
      activePage.current += 1;
    } else {
      setContinueFetching(false);
      // console.log("Full lol");
    }

    setCardSets((prevCardSets) => {
      const mergedCardSets = prevCardSets.concat(data as never[]);
      const uniqueMessageIds = new Set<string>();

      // remove duplicates and/or un-matching cards
      const result = mergedCardSets.filter(function (
        this: Set<string>,
        card: SpottingMetadata,
      ) {
        // check if card date matches with activeMonth.current
        const cardDate = new Date(card.date);
        const cardMonth = cardDate.getUTCMonth();
        const cardYear = cardDate.getUTCFullYear();
        const currentMonth = activeMonth.current.getUTCMonth();
        const currentYear = activeMonth.current.getUTCFullYear();

        // remove card if activeMonth and year don't match
        if (cardMonth !== currentMonth || cardYear !== currentYear) {
          return false;
        }

        // check for unique card id
        const card_id = card.id;
        return !this.has(card_id) && this.add(card_id);
      }, uniqueMessageIds);

      return result;
    });
  }, []);

  const grabMonths = useCallback(async () => {
    try {
      const searchQueryData: SearchMonthInput = { service: props.company };

      // if coming from search, add additional parameters
      if (props.search) {
        if (props.town) {
          searchQueryData.town = props.town;
        }
        if (props.country) {
          searchQueryData.country = props.country;
        }
      }
      // build parameters
      const QueryString = buildURLParams(searchQueryData);

      const response = await axios.get<MonthList>(
        `/metadata/available-months?${QueryString}`,
      );
      const data = response.data;

      setMonths(data);
    } catch (error) {
      setError(404);
    }
  }, []);
  useEffect(() => {
    void grabMonths();
  }, []);

  // fetch new data on mount or new query
  useEffect(() => {
    console.log("hi");

    // none still not defined
    if (router.query.page === undefined && months.length === 0) {
      console.log("none still not defined");
      console.log(months);
      return;
    }

    // set default query page if not set
    if (router.query.page === undefined && months.length !== 0) {
      console.log("set default query page if not set");
      router.query.page = "1";
    }

    if (months.length !== 0) {
      // checks if query is within range
      if (
        Number(router.query.page) > months.length ||
        Number(router.query.page) < 1
      ) {
        setError(404);
        return;
      }

      // reset all data
      const ACTIVE_INDEX = Number(router.query.page);

      if (months?.[ACTIVE_INDEX - 1]?.date) {
        setActiveIndex(ACTIVE_INDEX);
        activeMonth.current = new Date(months[ACTIVE_INDEX - 1]!.date);
        activePage.current = 0;
        availablePages.current = months[ACTIVE_INDEX - 1]!.pages;

        setCardSets([]);
        void fetchData();
      } else {
        console.log("something wrong occurred... blah blah blah");
      }
    }
  }, [router.query.page, months]);

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
      activeMonth={activeMonth}
      activeIndex={activeIndex}
      cardSets={cardSets}
      showCompany={props.showCompany ?? false}
      continueFetching={continueFetching}
      fetchData={fetchData}
    />
  );
}
