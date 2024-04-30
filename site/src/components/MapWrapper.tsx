import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function MapWrapper() {
  const Map = useMemo(
    () =>
      dynamic(() => import("~/components/Map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    [],
  );

  return <Map />;
}
