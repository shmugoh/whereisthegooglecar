import Link from "next/link";
import { api } from "~/utils/api";

import { CardSet } from "~/components/layout/card";
export default function Home() {
  const hello = api.post.hello.useQuery({ text: "World" });

  return (
    <>
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center">
          <p className="text-2xl text-white">
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>
          <CardSet />
        </div>
      </main>
    </>
  );
}
