"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  onSearch: (query: string) => void
  isSearching: boolean
  className?: string
  initialQuery?: string
  autoFocus?: boolean
  expanded?: boolean
}

export function SearchBar({
  onSearch,
  isSearching,
  className,
  initialQuery = "",
  autoFocus = false,
  expanded = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        document.getElementById("search-input")?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full items-center space-x-2 transition-all duration-200",
        expanded && !isFocused && "max-w-2xl mx-auto",
        className,
      )}
    >
      <div className={cn("relative flex-1", expanded && !isFocused && "max-w-2xl mx-auto")}>
        <Search
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all",
            isFocused && "text-foreground",
          )}
        />
        <Input
          id="search-input"
          type="text"
          placeholder="Find the file where I wrote about..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "pl-10 pr-16 py-6 bg-background transition-all",
            expanded && !isFocused && "text-lg shadow-lg",
            isFocused && "ring-2 ring-supabase-500",
          )}
          autoFocus={autoFocus}
        />
        <kbd
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex",
            isFocused && "opacity-50",
          )}
        >
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
      <Button type="submit" disabled={isSearching || !query.trim()} className="bg-supabase-500 hover:bg-supabase-600">
        {isSearching ? "Searching..." : "Search"}
      </Button>
    </form>
  )
}
