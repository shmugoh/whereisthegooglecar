import { priorityOrder } from "./constants";

function compareServices(a: string, b: string) {
  const indexA = priorityOrder.indexOf(a);
  const indexB = priorityOrder.indexOf(b);
  if (indexA === -1) return 1; // If a is not in the priority list, push it to the end
  if (indexB === -1) return -1; // If b is not in the priority list, push it to the front
  return indexA - indexB; // Compare indexes in the priority list
}

export function orderServices(unsortedServices: string[]) {
  return unsortedServices.sort((a, b) => compareServices(a, b));
}
