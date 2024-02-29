import Image from "next/image";
import errorImage from "../../public/404.png";

import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-between">
      <div className="flex flex-col items-center">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          404
        </h1>
        <Image
          src={errorImage}
          width={256}
          height={256}
          alt="Picture of the author"
        />
        <p className="text-xl text-muted-foreground">That&apos;s an error</p>
      </div>
      <Button onClick={() => router.back()}>Go back</Button>
    </div>
  );
}
