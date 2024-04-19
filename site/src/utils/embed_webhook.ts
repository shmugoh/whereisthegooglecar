import { formatDate } from "./date";

export type SubmissionInput = {
  date: Date;
  town: string;
  country: string;
  source: string;
  location?: string;
  service?: string;

  imageUrl?: string;

  type: "new" | "edit";
};

export function generateEmbed(input: SubmissionInput) {
  const titleType = input.type === "new" ? "New Submission" : "Edit Request";
  const dateFormatted = formatDate(input.date);

  const embed = {
    color: 11730954,
    title: `WhereIsTheGoogleCar - ${titleType}`,
    fields: [
      { name: "Date", value: dateFormatted },
      { name: "Town", value: input.town },
      { name: "Country", value: input.country },
      { name: "Source", value: input.source },
      { name: "Location", value: input.location ? input.location : "N/A" },
      { name: "Service", value: input.service ? input.service : "N/A" },
    ],
    image:
      input.type === "new"
        ? {
            url: input.imageUrl,
          }
        : undefined,
  };

  return {
    username: "WhereIsTheGoogleCar - Form",
    embeds: [embed],
  };
}
