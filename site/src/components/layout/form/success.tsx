import Image from "next/image";
import errorImage from "~/../public/404.png";

export const SUCCESS_TITLE = "Thank you!";
export const SUCCESS_DESCRIPTION =
  "We have received your submission. Our contributors will shortly review your request, make the necessary changes, and add it to our database if we find your submission valid.";

export default function SuccessPage() {
  return (
    <div className="flex h-[calc(100vh-250px)] flex-col items-center justify-center">
      <h2 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl ">
        {SUCCESS_TITLE}
      </h2>
      <Image
        src={errorImage}
        width={256}
        height={256}
        alt="A picture of Google's Street View mascot, Pegman, falling over."
      />
      <p className="text-center text-xl text-muted-foreground">
        {SUCCESS_DESCRIPTION}
      </p>
    </div>
  );
}
