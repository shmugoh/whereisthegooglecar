import React, { useCallback, useState, useEffect, useRef } from "react";
import { api } from "~/utils/api";
import EntriesPage, {
  BaseEntriesPage,
} from "~/components/layout/entry/entries";
import { useRouter } from "next/router";
import Error from "~/pages/_error";

type SearchProps = {
  town?: string;
  date: string;
  services?: string;
  countries?: string;
};

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

export default function Search() {
  // router & query settings
  const router = useRouter();
  const query = router.query as SearchProps;
  const { town, date, services, countries } = query;
  const [isReady, setIsReady] = useState(false);

  // initialize date
  const startDate = useRef<Date>(new Date());
  const endDate = useRef<Date>(new Date());

  const initDate = useCallback((date: string) => {
    if (date) {
      type DateObject = {
        from: string;
        to: string;
      };
      const dateObject = JSON.parse(date) as DateObject;
      startDate.current = new Date(dateObject.from);
      endDate.current = new Date(dateObject.to);
    }
  }, []);

  // grabs months once queries are set
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (town || date || services || countries) {
      initDate(query.date);
      setIsReady(true);
    }
  }, [town, date, services, countries]);

  if (isReady) {
    return (
      <EntriesPage
        company={services}
        country={countries}
        town={town}
        startDate={startDate.current}
        endDate={endDate.current}
        showCompany={true}
      />
    );
  }
}
