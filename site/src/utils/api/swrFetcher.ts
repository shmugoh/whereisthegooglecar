import axios, { type AxiosInstance } from "axios";
import { env } from "~/env";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
});

export const fetcher = (url: string) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  axiosInstance.get(url).then((res) => res.data);
