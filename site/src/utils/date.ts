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
    // console.log("Same Month... Stop fetching");
    setContinueFetching(false);
    return { currentStartDate: startDate, currentEndDate: finalDate };
  }

  // If the current start and end dates are not in the same month
  if (currentStartDate.getMonth() !== currentEndDate.getMonth()) {
    // console.log(`Not Same Month... Continue fetching`);
    currentStartDate = new Date(
      currentEndDate.getFullYear(),
      currentEndDate.getMonth(),
      1,
    );
    currentEndDate = new Date(
      currentEndDate.getFullYear(),
      currentEndDate.getMonth(),
      currentEndDate.getDate(),
    );
    // console.log(currentStartDate, currentEndDate);
    return { currentStartDate, currentEndDate };
  }

  // if current start date matches month and year

  // simulate decrementing by one month
  const buffCurrentStartDate = new Date(
    currentStartDate.getFullYear(),
    currentStartDate.getMonth() - 1,
    1,
  );

  if (
    buffCurrentStartDate.getMonth() === startDate.getMonth() &&
    buffCurrentStartDate.getFullYear() === startDate.getFullYear()
    // might not work well if dec <- jan
  ) {
    // console.log("Exact Month and Year... Stop fetching");

    // exact day of input month
    currentStartDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    );
    // last day of input month
    currentEndDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
    );
    // console.log(currentStartDate, currentEndDate);
    setContinueFetching(false);
    return { currentStartDate, currentEndDate };
  }

  // If the current start date is the start date
  // works when the start date is the first day of the month
  if (currentStartDate.getTime() === startDate.getTime()) {
    // console.log("Start Date... Stop fetching");
    setContinueFetching(false);
    // console.log(currentStartDate, currentEndDate);
    return { currentStartDate, currentEndDate };
  }

  // console.log("Decrement Month... Continue fetching");

  // console.log("Input: ", startDate);

  // console.log("Before: ", currentStartDate);

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

  // console.log("After: ", currentStartDate);

  return { currentStartDate, currentEndDate };
}
