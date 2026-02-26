import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const BACKEND_IP = "13.250.125.230";
// const BACKEND_IP = "localhost";

export const NEXT_PUBLIC_API_URL = `http://${BACKEND_IP}:3000`;
export const PYTHON_BACKEND_URL = `http://${BACKEND_IP}:8000`;
export const CLOUDFRONT_URL =
  "https://jpeg-phd-innovations-austin.trycloudflare.com";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
