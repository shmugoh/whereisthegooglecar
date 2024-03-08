import React, { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

type SearchProps = {
  town?: string;
  date: [from: string, to: string];
  services?: string;
  countries?: string;
};

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

export default function Search() {
  const { query, isReady } = useRouter();
  const { town, date, services, countries } = query;

  const dataMutation = api.query.queryByFilter.useMutation({});

  const [data, setData] = useState({});

  const fetchData = async () => {
    try {
      console.log(0, town, date, services, countries);

      const data = await dataMutation.mutateAsync({
        company: services as string,
        date: date,
        town: town as string,
        country: countries as string,
      });
      console.log(data);
      setData(data);
    } catch (error) {
      console.error(error);
    }
  }; // Add router query data as dependencies

  useEffect(() => {
    if (isReady) {
      console.log(town, date, services, countries);
      void fetchData();
    }
  }, [isReady]);

  if (!isReady || JSON.stringify(data) === "{}") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>{JSON.stringify(data)}</p>
    </div>
  );
}
