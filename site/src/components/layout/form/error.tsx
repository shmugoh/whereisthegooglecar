type ErrorMessageTypes = {
  errorMessage: string | null;
};

export function ErrorMessage(props: ErrorMessageTypes) {
  if (props.errorMessage) {
    return (
      <div key="1" className="w-full rounded bg-red-600 p-4">
        <div className="flex gap-1">
          <p className="font-bold text-red-50">Submission Failed:</p>
          <p className="text-red-200">{props.errorMessage}</p>
        </div>
      </div>
    );
  }

  return null;
}
