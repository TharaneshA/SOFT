"use client"

import { cn } from "@/lib/utils"

interface LoadingAnimationProps {
  className?: string
}

export function LoadingAnimation({ className }: LoadingAnimationProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-supabase-500/30"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-transparent border-t-supabase-500 animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full bg-supabase-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export function LoadingResults() {
  return (
    <div className="p-8 flex flex-col items-center justify-center h-full">
      <LoadingAnimation />
      <p className="mt-4 text-muted-foreground animate-pulse">Searching your files...</p>
    </div>
  )
}

export function LoadingFileItem() {
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 animate-pulse">
      <div className="mt-px h-4 w-4 bg-muted rounded-sm"></div>
      <div className="space-y-1 flex-1">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-full"></div>
      </div>
    </div>
  )
}

export function LoadingFileDetails() {
  return (
    <div className="h-full flex flex-col animate-pulse">
      <div className="p-4 border-b">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="mb-4">
          <div className="h-4 bg-muted rounded w-1/4 mb-1"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
        <div>
          <div className="h-4 bg-muted rounded w-1/4 mb-1"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded w-full"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
