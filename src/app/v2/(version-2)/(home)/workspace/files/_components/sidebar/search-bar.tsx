"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { useNavigate, useSearch } from "../../_lib/router-shim";

export function SearchBar() {
  const navigate = useNavigate();
  const searchParams = useSearch();
  const [query, setQuery] = useState(searchParams.type || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      search: { ...searchParams, type: query.trim() || undefined },
    });
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
      <Input
        placeholder="Filter by type (doc, media, archive)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-8 pl-8 text-xs w-full"
      />
    </form>
  );
}

export default SearchBar;
