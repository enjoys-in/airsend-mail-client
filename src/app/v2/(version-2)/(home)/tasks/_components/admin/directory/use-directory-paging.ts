import { useState } from "react";
import { useDebouncedValue } from "@tasks/_hooks/use-debounced-value";

const SEARCH_DEBOUNCE_MS = 250;

export function useDirectoryPaging() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [searchedFor, setSearchedFor] = useState(debouncedSearch);
  const [page, setPage] = useState(0);

  if (debouncedSearch !== searchedFor) {
    setSearchedFor(debouncedSearch);
    setPage(0);
  }

  return { search, setSearch, debouncedSearch, page, setPage };
}
