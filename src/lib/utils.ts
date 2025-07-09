import { clsx, type ClassValue } from "clsx";
import { formatInTimeZone } from "date-fns-tz";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomNumber(length = 5): string {
  const digits = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += digits[Math.floor(Math.random() * digits.length)];
  }
  return result;
}

export const sizesImage =
  "(max-width: 768px) 33vw, (max-width: 1200px) 50vw, 100vw";

export function formatRupiah(rupiah: number) {
  if (rupiah) {
    const formatter = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
    return formatter.format(Math.ceil(rupiah));
  }
  return "Rp 0";
}

export const timeNow = async () => {
  const jakartaNow = formatInTimeZone(
    new Date(),
    "Asia/Jakarta",
    "yyyy-MM-dd HH:mm:ss"
  );

  const now = new Date(jakartaNow);
  return now;
};
