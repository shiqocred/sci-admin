"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { useState } from "react";

/**
 * @description
 * Custom hook untuk mengelola query bukan searchParams.
 * Termasuk `useDebounce` otomatis agar search tidak terlalu cepat trigger.
 *
 * @returns
 * - `search`: nilai dari
 * - `searchValue`: hasil debounced dari search
 * - `setSearch`: setter untuk update query
 *
 * Example Usage:
 * ```ts
 *   const { search, searchValue, setSearch } = useSearch();
 *   const { data, ... } = useGet({ q: searchValue });
 *
 *   return <Input value={search ?? ""} onChange={(e) => setSearch(e.target.value)} />
 * ```
 */
export const useSearch = () => {
  const [search, setSearch] = useState("");
  const searchValue = useDebounce(search);

  return { search, searchValue, setSearch };
};
