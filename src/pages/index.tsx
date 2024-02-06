import { api } from "~/utils/api";

import { CardSet } from "~/components/layout/entry/card";

export default function Home({}) {
  const getLatest = api.post.getLatest.useQuery();

  if (!getLatest.data) {
    return <div>Loading...</div>;
  }

  if (getLatest.data) {
    return (
      <div className="flex flex-col items-center gap-4">
        <CardSet month="February" year="2024" info={getLatest.data} />
      </div>
    );
  }
}
