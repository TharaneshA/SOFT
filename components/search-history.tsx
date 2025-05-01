"use client"

import { useState, useEffect } from "react"
import { Clock, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface SearchHistoryProps {
  onSelectQuery: (query: string) => void
  className?: string
}

interface HistoryItem {
  id: string
  query: string
  timestamp: number
}

export function SearchHistory({ onSelectQuery, className }: SearchHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem("search-history")
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory) as HistoryItem[]
        setHistory(parsedHistory)
      } catch (error) {
        console.error("Failed to parse search history:", error)
      }
    }
  }, [])

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("search-history")
  }

  const removeHistoryItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("search-history", JSON.stringify(updatedHistory))
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  if (history.length === 0) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>No search history yet</p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 className="text-sm font-medium">Recent Searches</h3>
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          Clear All
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {history.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted/50 cursor-pointer"
              onClick={() => onSelectQuery(item.query)}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Search className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <span className="truncate">{item.query}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeHistoryItem(item.id)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// Helper function to add a search query to history
export function addToSearchHistory(query: string) {
  if (!query.trim()) return

  const savedHistory = localStorage.getItem("search-history")
  let history: HistoryItem[] = []

  if (savedHistory) {
    try {
      history = JSON.parse(savedHistory) as HistoryItem[]
    } catch (error) {
      console.error("Failed to parse search history:", error)
    }
  }

  // Check if query already exists
  const existingIndex = history.findIndex((item) => item.query === query)
  if (existingIndex !== -1) {
    // Remove existing entry
    history.splice(existingIndex, 1)
  }

  // Add new entry at the beginning
  history.unshift({
    id: Date.now().toString(),
    query,
    timestamp: Date.now(),
  })

  // Limit history to 20 items
  if (history.length > 20) {
    history = history.slice(0, 20)
  }

  localStorage.setItem("search-history", JSON.stringify(history))
}
