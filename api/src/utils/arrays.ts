import { PRIORITY_ORDER } from "./constants";

function compareServices(
  a: { label: string; value: any },
  b: { label: string; value: any }
) {
  const indexA = PRIORITY_ORDER.indexOf(a.label);
  const indexB = PRIORITY_ORDER.indexOf(b.label);
  if (indexA === -1) return 1; // If a is not in the priority list, push it to the end
  if (indexB === -1) return -1; // If b is not in the priority list, push it to the front
  return indexA - indexB; // Compare indexes in the priority list
}

export function orderServices(
  unsortedServices: { label: string; value: any }[]
) {
  return unsortedServices.sort(compareServices);
}

export function sortCountriesByLabel(countries: CountriesList): CountriesList {
  return countries.sort((a, b) => {
    const labelA = a.label.split(" - ")[1];
    const labelB = b.label.split(" - ")[1];

    if (labelA === "Others") return 1;
    if (labelB === "Others") return -1;

    return labelA.localeCompare(labelB);
  });
}
