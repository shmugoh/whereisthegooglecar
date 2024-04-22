import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";

type SubmitButtonTypes = {
  isLoading: boolean;
  loadingMessage: string;
};

export function SubmitButton(props: SubmitButtonTypes) {
  if (props.isLoading) {
    return (
      <Button disabled>
        {props.loadingMessage !== "Submit" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {props.loadingMessage}
      </Button>
    );
  }

  return <Button type="submit">Submit</Button>;
}
