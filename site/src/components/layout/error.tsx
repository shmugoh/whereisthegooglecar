import Image from "next/image";
import errorImage from "../../../public/404.png";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";

import type { NextPageContext } from "next";

type CustomErrorProps = {
  statusCode: number | null;
};

function CustomError(props: CustomErrorProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-between gap-4">
      <div className="flex flex-col items-center">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {props.statusCode ? `${props.statusCode}` : "Client Error"}
        </h1>
        <Image
          src={errorImage}
          width={256}
          height={256}
          alt="A picture of Google's Street View mascot, Pegman, falling over."
        />
        <p className="text-xl text-muted-foreground">That&apos;s an error</p>
      </div>
      <Button onClick={() => router.back()}>Go back</Button>
    </div>
  );
}
// return statusCode in HTTPS response
CustomError.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default CustomError;
