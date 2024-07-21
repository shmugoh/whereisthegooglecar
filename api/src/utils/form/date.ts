export const convertDate = (date: string) => {
  const d = new Date(Date.parse(date));
  const formattedDate = new Date(
    // using UTC to avoid timezone issues
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate()
  ).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
    day: "numeric",
  });
  return formattedDate;
};
export const formatDate = (date: Date) => {
  const formattedYear = date.getUTCFullYear();
  const formattedMonth =
    (date.getUTCMonth() + 1 < 10 ? "0" : "") +
    (date.getUTCMonth() + 1).toString();
  const formattedDay =
    (date.getUTCDate() < 10 ? "0" : "") + date.getUTCDate().toString();

  return `${formattedYear}/${formattedMonth}/${formattedDay}`;
};
