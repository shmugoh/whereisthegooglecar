import Link from "next/link";
import { api } from "~/utils/api";

import { CardSet } from "~/components/layout/entry/card";
import { Header } from "~/components/layout/header";
export default function Home() {
  const hello = api.post.hello.useQuery({ text: "World" });

  return (
    <div className="items-center">
      <CardSet />
    </div>
  );

  // TODO
  addServerSideProps: async () => {
    return {
      props: {},
    };
  };
}
