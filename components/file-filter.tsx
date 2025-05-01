"use client"

import { useState } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

export interface FileFilterOptions {
  fileTypes: string[]
  dateRange: [Date | null, Date | null]
  minSize?: number
  maxSize?: number
}

interface FileFilterProps {
  onFilterChange: (filters: FileFilterOptions) => void
  availableFileTypes: string[]
}

export function FileFilter({ onFilterChange, availableFileTypes }: FileFilterProps) {
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [sizeRange, setSizeRange] = useState<[number, number]>([0, 100])
  const [activeFilters, setActiveFilters] = useState(0)

  const handleFileTypeChange = (fileType: string) => {
    setSelectedFileTypes((prev) => {
      const newSelection = prev.includes(fileType) ? prev.filter((type) => type !== fileType) : [...prev, fileType]

      // Update active filters count
      updateActiveFiltersCount(newSelection, dateRange, sizeRange)

      // Notify parent component
      onFilterChange({
        fileTypes: newSelection,
        dateRange,
        minSize: sizeRange[0],
        maxSize: sizeRange[1],
      })

      return newSelection
    })
  }

  const handleDateRangeChange = (range: [Date | null, Date | null]) => {
    setDateRange(range)
    updateActiveFiltersCount(selectedFileTypes, range, sizeRange)
    onFilterChange({
      fileTypes: selectedFileTypes,
      dateRange: range,
      minSize: sizeRange[0],
      maxSize: sizeRange[1],
    })
  }

  const handleSizeRangeChange = (range: [number, number]) => {
    setSizeRange(range)
    updateActiveFiltersCount(selectedFileTypes, dateRange, range)
    onFilterChange({
      fileTypes: selectedFileTypes,
      dateRange,
      minSize: range[0],
      maxSize: range[1],
    })
  }

  const updateActiveFiltersCount = (
    fileTypes: string[],
    dates: [Date | null, Date | null],
    sizes: [number, number],
  ) => {
    let count = 0
    if (fileTypes.length > 0) count++
    if (dates[0] !== null || dates[1] !== null) count++
    if (sizes[0] > 0 || sizes[1] < 100) count++
    setActiveFilters(count)
  }

  const clearFilters = () => {
    setSelectedFileTypes([])
    setDateRange([null, null])
    setSizeRange([0, 100])
    setActiveFilters(0)
    onFilterChange({
      fileTypes: [],
      dateRange: [null, null],
      minSize: 0,
      maxSize: 100,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          {activeFilters > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {activeFilters}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Filter Files</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">File Type</DropdownMenuLabel>
          {availableFileTypes.map((type) => (
            <DropdownMenuCheckboxItem
              key={type}
              checked={selectedFileTypes.includes(type)}
              onCheckedChange={() => handleFileTypeChange(type)}
            >
              {type.toUpperCase()}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Date Modified</DropdownMenuLabel>
          <div className="px-2 py-1.5">
            <div className="flex justify-between text-xs mb-1">
              <span>Today</span>
              <span>Older</span>
            </div>
            <Slider
              defaultValue={[0, 100]}
              max={100}
              step={1}
              className="my-2"
              onValueChange={(value) => {
                // This is a simplified example - in a real app, you'd convert these values to actual dates
                const today = new Date()
                const oneMonthAgo = new Date()
                oneMonthAgo.setMonth(today.getMonth() - 1)

                const startDate = value[0] === 0 ? today : null
                const endDate = value[1] === 100 ? oneMonthAgo : null

                handleDateRangeChange([startDate, endDate])
              }}
            />
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">File Size</DropdownMenuLabel>
          <div className="px-2 py-1.5">
            <div className="flex justify-between text-xs mb-1">
              <span>Small</span>
              <span>Large</span>
            </div>
            <Slider
              defaultValue={[0, 100]}
              max={100}
              step={1}
              className="my-2"
              onValueChange={(value) => handleSizeRangeChange([value[0], value[1]])}
            />
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <div className="p-2">
          <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
