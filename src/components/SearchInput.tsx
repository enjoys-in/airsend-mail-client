"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { useAppDispatch } from "@/store/hooks";
import { updateFilter } from "@/store/slices/mail";

function SearchInput() {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const searchBarRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState("");
  const [timer, setTimer] = useState<NodeJS.Timer | null>(null);
  const dispatch = useAppDispatch();
  // debounce searching
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(updateFilter({ type: "search", value: searchText }));
    }, 500);
    setTimer(timer);
    return () => {
      clearTimeout(timer);
      setTimer(null);
    };
  }, [searchText, dispatch]);
  return (
    <>
      <div className="hidden md:flex">
        <form className="h-full flex-1">
          <div className="relative h-10">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className=" pl-8 bg-zinc-200 dark:bg-[#181A1D] border-none placeholder:text-zinc-600 max-w-[700px]"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
            />
            {searchText !== "" && (
              <Button
                className="absolute right-1 bottom-0"
                size={"icon"}
                variant={"ghost"}
                onClick={(e) => {
                  e.preventDefault();
                  setSearchText("");
                  dispatch(updateFilter({ type: "search", value: "" }));
                }}
              >
                <X className="text-muted-foreground" />
              </Button>
            )}
          </div>
        </form>
      </div>
      <div className="flex flex-1 justify-end md:hidden">
        <form className={cn("h-full flex w-full", !showSearchBar && "hidden")}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              ref={searchBarRef}
              className={cn(
                "pl-8 bg-zinc-200 dark:bg-[#181A1D] border-none placeholder:text-zinc-600 max-w-[700px]"
              )}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
            />
            <Button
              className="absolute right-0 bottom-0"
              size={"icon"}
              variant={"ghost"}
              onClick={(e) => {
                e.preventDefault();
                setSearchText("");
                setShowSearchBar(false);
              }}
            >
              <X className="text-muted-foreground" />
            </Button>
          </div>
        </form>
        <Button
          variant={"ghost"}
          className={cn("p-2 flex", showSearchBar && "hidden")}
          onClick={() => {
            setShowSearchBar(true);
            setTimeout(() => {
              searchBarRef.current?.focus();
            }, 0);
          }}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

export default SearchInput;
