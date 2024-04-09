import Turnstile, { useTurnstile } from "react-turnstile";

import { env } from "~/env";

export const TurnstileWidget = () => {
  // const turnstile = useTurnstile();

  return (
    <Turnstile
      sitekey={env.NEXT_PUBLIC_CF_PUBLIC_KEY}

      // onVerify={(token) => {
      //   fetch("/login", {
      //     method: "POST",
      //     body: JSON.stringify({ token }),
      //   }).then((response) => {
      //     if (!response.ok) turnstile.reset();
      //   });
      // }}
    />
  );
};
