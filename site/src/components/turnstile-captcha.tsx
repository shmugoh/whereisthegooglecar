import Turnstile from "react-turnstile";
import { env } from "~/env";

type TurnstileWidgetProps = {
  setToken: (token: string) => void;
};

export const TurnstileWidget = ({ setToken }: TurnstileWidgetProps) => {
  // return token
  const handleToken = (token: string) => {
    if (token) {
      setToken(token);
    }
  };

  return (
    <Turnstile
      sitekey={env.NEXT_PUBLIC_CF_PUBLIC_KEY}
      onVerify={handleToken}
      fixedSize
    />
  );
};
