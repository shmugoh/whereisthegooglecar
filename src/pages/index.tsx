import Link from "next/link";

import { api } from "~/utils/api";

import { GoogleCard } from "~/components/card";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "World" });

  return (
    <>
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center p-12">
          <p className="text-2xl text-white">
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>

          <div className="flex flex-wrap">
            <GoogleCard
              date="February 1st, 2023"
              town="Bogota, Colombia"
              countryEmoji="🇨🇴"
              imageUrl="https://cdn.discordapp.com/attachments/774703077172838430/1189837268148568194/28_12_2023.png"
              sourceUrl="#"
            />
          </div>
        </div>
      </main>
    </>
  );
}
