import axios, { type AxiosResponse, type AxiosInstance } from "axios";
import { env } from "~/env";

export const axiosInstance: AxiosInstance = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
});

export const fetcher = (url: string) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    axiosInstance.get(url).then((res) => res.data);

// prettier-ignore
export async function presignPaload(url: string, { arg }: { arg: presignS3 }): Promise<presign_s3_output> {
  try {
    const response = await axiosInstance.post<presign_s3_output>(url, arg);
    return response.data;
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.response) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw error.response.data;
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}

// prettier-ignore
export async function submitPayload(url: string, { arg }: { arg: FormSchema }): Promise<form_output> {
  try {
    const response = await axiosInstance.post<form_output>(url, arg);
  return response.data;
} catch (error: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (error.response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    throw error.response.data;
  } else {
    throw new Error('An unexpected error occurred');
  }
}
}

// prettier-ignore
export async function editPayload(url: string, { arg }: { arg: FormSchema }): Promise<form_output> {
  try {
    const response = await axiosInstance.post<form_output>(url, arg);
  return response.data;
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.response) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw error.response.data;
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}
