import { type Dispatch, type SetStateAction } from "react";

export const convertDate = (date: string) => {
  const d = new Date(Date.parse(date));
  const formattedDate = new Date(
    // using UTC to avoid timezone issues
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
  ).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
    day: "numeric",
  });
  return formattedDate;
};

type UpdateDateProps = {
  startDate: Date;
  finalDate: Date;
  currentStartDate: Date;
  currentEndDate: Date;
  setContinueFetching: Dispatch<SetStateAction<boolean>>;
};

export function updateDate({
  startDate,
  finalDate,
  currentStartDate,
  currentEndDate,
  setContinueFetching,
}: UpdateDateProps): { currentStartDate: Date; currentEndDate: Date } {
  // If the start and end dates are in the same month
  if (startDate.getMonth() === finalDate.getMonth()) {
    setContinueFetching(false);
    return { currentStartDate: startDate, currentEndDate: finalDate };
  }

  // If the current start and end dates are not in the same month
  if (currentStartDate.getMonth() !== currentEndDate.getMonth()) {
    currentStartDate = new Date(
      currentEndDate.getFullYear(),
      currentEndDate.getMonth(),
      1,
    );
    currentEndDate = new Date(
      currentEndDate.getFullYear(),
      currentEndDate.getMonth() + 1,
      0,
    );
    return { currentStartDate, currentEndDate };
  }

  // If the current start date is the start date
  if (currentStartDate.getTime() === startDate.getTime()) {
    setContinueFetching(false);
    return { currentStartDate, currentEndDate };
  }

  // Otherwise, decrement the current start date by one month
  currentStartDate = new Date(
    currentStartDate.getFullYear(),
    currentStartDate.getMonth() - 1,
    1,
  );
  currentEndDate = new Date(
    currentStartDate.getFullYear(),
    currentStartDate.getMonth() + 1,
    0,
  );

  return { currentStartDate, currentEndDate };
}
