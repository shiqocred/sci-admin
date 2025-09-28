import { CheckedState } from "@radix-ui/react-checkbox";
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

export function formatRupiah(rupiah: string | number): string {
  const value =
    typeof rupiah === "string"
      ? parseFloat(rupiah.replace(/[^\d.-]/g, ""))
      : rupiah;

  if (!value || isNaN(value)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Math.ceil(value));
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

export const pronoun = (num: string | number, es?: boolean) => {
  const value =
    typeof num === "string" ? parseFloat(num.replace(/[^\d.-]/g, "")) : num;

  if (!value || isNaN(value)) return "";
  return value > 1 ? (es ? "es" : "s") : "";
};

export const numericString = (e: string) => {
  return e.startsWith("0") ? e.replace(/^0+/, "") : e;
};

export function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randIndex = Math.floor(Math.random() * chars.length);
    result += chars[randIndex];
  }
  return result;
}

export const checkedFormat = (value: string): CheckedState => {
  if (value === "true") return true;
  if (value === "false") return false;
  return "indeterminate";
};

export const checkedToString = (
  val: CheckedState
): "true" | "false" | "indeterminate" => {
  if (val === true) return "true";
  if (val === false) return "false";
  return "indeterminate";
};

export function numberToTerbilang(n: number): string {
  const angka = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
    "sepuluh",
    "sebelas",
  ];

  function toWords(x: number): string {
    if (x < 12) {
      return angka[x];
    } else if (x < 20) {
      return toWords(x - 10) + " belas";
    } else if (x < 100) {
      return (
        toWords(Math.floor(x / 10)) +
        " puluh" +
        (x % 10 !== 0 ? " " + toWords(x % 10) : "")
      );
    } else if (x < 200) {
      return "seratus" + (x - 100 > 0 ? " " + toWords(x - 100) : "");
    } else if (x < 1000) {
      return (
        toWords(Math.floor(x / 100)) +
        " ratus" +
        (x % 100 !== 0 ? " " + toWords(x % 100) : "")
      );
    } else if (x < 2000) {
      return "seribu" + (x - 1000 > 0 ? " " + toWords(x - 1000) : "");
    } else if (x < 1000000) {
      return (
        toWords(Math.floor(x / 1000)) +
        " ribu" +
        (x % 1000 !== 0 ? " " + toWords(x % 1000) : "")
      );
    } else if (x < 1000000000) {
      return (
        toWords(Math.floor(x / 1000000)) +
        " juta" +
        (x % 1000000 !== 0 ? " " + toWords(x % 1000000) : "")
      );
    } else if (x < 1000000000000) {
      return (
        toWords(Math.floor(x / 1000000000)) +
        " miliar" +
        (x % 1000000000 !== 0 ? " " + toWords(x % 1000000000) : "")
      );
    } else if (x < 1000000000000000) {
      return (
        toWords(Math.floor(x / 1000000000000)) +
        " triliun" +
        (x % 1000000000000 !== 0 ? " " + toWords(x % 1000000000000) : "")
      );
    }
    return "";
  }

  if (n === 0) return "nol rupiah";
  return toWords(n).trim() + " rupiah";
}

export const formatRole = (role: string) => {
  if (role === "BASIC") return "Pet Owner";
  if (role === "PETSHOP") return "Pet Shop";
  if (role === "VETERINARIAN") return "Vet Clinic";
  return "";
};
