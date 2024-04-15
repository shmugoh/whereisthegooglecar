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
