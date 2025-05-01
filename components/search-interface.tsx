"use client"

import { useState, useEffect, useRef } from "react"
import { ResizableSidebar } from "@/components/resizable-sidebar"
import { FileList } from "@/components/file-list"
import { FileDetails } from "@/components/file-details"
import { SearchBar } from "@/components/search-bar"
import { SearchHistory, addToSearchHistory } from "@/components/search-history"
import { SettingsDialog } from "@/components/settings-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { FileFilter, type FileFilterOptions } from "@/components/file-filter"
import { WelcomeScreen } from "@/components/welcome-screen"
import { LoadingResults } from "@/components/loading-animation"
import type { FileType } from "@/types/file"
import { mockFiles } from "@/lib/mock-data"
import { searchFiles } from "@/lib/tauri-service"
import { getWebSocketService } from "@/lib/websocket-service"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { History, HelpCircle } from "lucide-react"
import { Search } from "lucide-react"

export function SearchInterface() {
  const [files, setFiles] = useState<FileType[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileType[]>([])
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showWelcome, setShowWelcome] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("results")
  const [fileFilters, setFileFilters] = useState<FileFilterOptions>({
    fileTypes: [],
    dateRange: [null, null],
  })
  const { toast } = useToast()
  const searchBarRef = useRef<HTMLDivElement>(null)

  // Get available file types for filtering
  const availableFileTypes = Array.from(new Set(files.map((file) => file.type.toLowerCase())))

  useEffect(() => {
    // Check if user has used the app before
    const hasUsedBefore = localStorage.getItem("has-used-app")
    if (hasUsedBefore) {
      setShowWelcome(false)
    }
  }, [])

  useEffect(() => {
    // Apply filters to files
    if (files.length === 0) {
      setFilteredFiles([])
      return
    }

    let result = [...files]

    // Filter by file type
    if (fileFilters.fileTypes.length > 0) {
      result = result.filter((file) => fileFilters.fileTypes.includes(file.type.toLowerCase()))
    }

    // Filter by date range
    if (fileFilters.dateRange[0] || fileFilters.dateRange[1]) {
      result = result.filter((file) => {
        const fileDate = file.modified.getTime()
        const startDate = fileFilters.dateRange[0]?.getTime() || 0
        const endDate = fileFilters.dateRange[1]?.getTime() || Number.POSITIVE_INFINITY

        return fileDate >= startDate && fileDate <= endDate
      })
    }

    // Filter by size (simplified)
    if (fileFilters.minSize !== undefined || fileFilters.maxSize !== undefined) {
      // In a real app, you'd have actual file sizes
      // This is just a placeholder implementation
      const minSize = fileFilters.minSize || 0
      const maxSize = fileFilters.maxSize || 100

      result = result.filter((file) => {
        // Simulate file size based on content length
        const simulatedSize = (file.content.length / 1000) % 100
        return simulatedSize >= minSize && simulatedSize <= maxSize
      })
    }

    setFilteredFiles(result)

    // Update selected file if it's filtered out
    if (selectedFile && !result.find((f) => f.id === selectedFile.id)) {
      setSelectedFile(result.length > 0 ? result[0] : null)
    }
  }, [files, fileFilters, selectedFile])

  useEffect(() => {
    // Select the first file by default after search
    if (filteredFiles.length > 0 && !selectedFile && hasSearched) {
      setSelectedFile(filteredFiles[0])
    }
  }, [filteredFiles, selectedFile, hasSearched])

  useEffect(() => {
    // Try to connect to the WebSocket server
    const ws = getWebSocketService()

    ws.connect().catch((error) => {
      console.error("Failed to connect to WebSocket server:", error)
      // We'll continue without WebSocket for now
    })

    // Set up WebSocket message handlers
    ws.on("searchResult", (data) => {
      // In a real implementation, this would parse the search results
      console.log("Received search results:", data)
    })

    return () => {
      ws.disconnect()
    }
  }, [])

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    setSearchQuery(query)
    setIsSearching(true)
    setHasSearched(true)
    setShowWelcome(false)
    setActiveTab("results")

    // Save to localStorage that user has used the app
    localStorage.setItem("has-used-app", "true")

    // Add to search history
    addToSearchHistory(query)

    try {
      // Try to use the Tauri backend first
      const results = await searchFiles(query)

      if (results.length > 0) {
        setFiles(results)
      } else {
        // Fallback to mock data for demo purposes
        const filteredMockFiles = mockFiles.filter(
          (file) =>
            file.name.toLowerCase().includes(query.toLowerCase()) ||
            file.content.toLowerCase().includes(query.toLowerCase()) ||
            file.summary.toLowerCase().includes(query.toLowerCase()),
        )

        setFiles(filteredMockFiles.length > 0 ? filteredMockFiles : mockFiles)
      }

      // Also send the query via WebSocket for real-time updates
      try {
        const ws = getWebSocketService()
        ws.search(query)
      } catch (error) {
        console.error("Failed to send WebSocket search:", error)
      }
    } catch (error) {
      console.error("Search failed:", error)
      toast({
        title: "Search failed",
        description: "An error occurred while searching files.",
        variant: "destructive",
      })

      // Fallback to mock data
      const filteredMockFiles = mockFiles.filter(
        (file) =>
          file.name.toLowerCase().includes(query.toLowerCase()) ||
          file.content.toLowerCase().includes(query.toLowerCase()) ||
          file.summary.toLowerCase().includes(query.toLowerCase()),
      )

      setFiles(filteredMockFiles.length > 0 ? filteredMockFiles : [])
    } finally {
      setIsSearching(false)
    }
  }

  const handleFilterChange = (filters: FileFilterOptions) => {
    setFileFilters(filters)
  }

  const handleGetStarted = () => {
    setShowWelcome(false)
    // Focus the search bar
    setTimeout(() => {
      document.getElementById("search-input")?.focus()
    }, 100)
  }

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <div className="flex flex-col w-full h-full">
        <header className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-supabase-500">SOFT</h1>
            <span className="bg-supabase-500 text-white text-xs px-1.5 py-0.5 rounded-full">Beta</span>
          </div>
          <div ref={searchBarRef} className="flex-1 mx-4">
            <SearchBar
              onSearch={handleSearch}
              isSearching={isSearching}
              initialQuery={searchQuery}
              expanded={!hasSearched}
            />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" title="Help">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <SettingsDialog />
          </div>
        </header>

        {isSearching ? (
          <LoadingResults />
        ) : hasSearched ? (
          <div className="flex flex-1 overflow-hidden">
            <ResizableSidebar minWidth={280} maxWidth={500} defaultWidth={320} id="file-sidebar">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="px-4 py-2 border-b flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="results" className="gap-1">
                      <Search className="h-4 w-4" />
                      Results
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-1">
                      <History className="h-4 w-4" />
                      History
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <FileFilter onFilterChange={handleFilterChange} availableFileTypes={availableFileTypes} />
                  </div>
                </div>

                <TabsContent value="results" className="flex-1 p-0 m-0">
                  <FileList
                    files={filteredFiles}
                    selectedFile={selectedFile}
                    onSelectFile={setSelectedFile}
                    isLoading={isSearching}
                  />
                </TabsContent>

                <TabsContent value="history" className="flex-1 p-0 m-0">
                  <SearchHistory onSelectQuery={handleSearch} />
                </TabsContent>
              </Tabs>
            </ResizableSidebar>

            <div className="flex-1 overflow-hidden">
              <FileDetails file={selectedFile} isLoading={isSearching} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md text-center">
              <h2 className="text-2xl font-bold mb-2">Start Searching</h2>
              <p className="text-muted-foreground mb-6">
                Type a natural language query to find your files. Try something like:
              </p>
              <div className="space-y-2 text-left">
                <div
                  className="p-2 rounded-md bg-muted/50 cursor-pointer hover:bg-muted"
                  onClick={() => handleSearch("Find my recent documents about Python")}
                >
                  "Find my recent documents about Python"
                </div>
                <div
                  className="p-2 rounded-md bg-muted/50 cursor-pointer hover:bg-muted"
                  onClick={() => handleSearch("Show me PDF files from last month")}
                >
                  "Show me PDF files from last month"
                </div>
                <div
                  className="p-2 rounded-md bg-muted/50 cursor-pointer hover:bg-muted"
                  onClick={() => handleSearch("Where did I save my notes about databases?")}
                >
                  "Where did I save my notes about databases?"
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
