import { api } from "~/utils/api";
import { CardSet } from "~/components/layout/entry/card";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Ref,
  MutableRefObject,
} from "react";
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
  months: MutableRefObject<Date[]>;
  month: MutableRefObject<Date>;
  activeIndex: MutableRefObject<number>;
  cardSets: never[];
  showCompany: boolean;
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

      <div className="justify-center">
        <CardSet
          month={props.month.current.getUTCMonth()}
          year={props.month.current.getUTCFullYear().toString()}
          info={props.cardSets}
          showCompany={props.showCompany}
        />
      </div>

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
    return <Error statusCode={error} />;
  }

  return (
    <BaseEntriesPage
      months={months}
      month={month}
      activeIndex={activeIndex}
      cardSets={cardSets}
      showCompany={props.showCompany ?? false}
    />
  );
}
