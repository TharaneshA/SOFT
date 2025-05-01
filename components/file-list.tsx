"use client"

import { FileIcon, FileTextIcon, ImageIcon, CodeIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FileType } from "@/types/file"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingFileItem } from "@/components/loading-animation"

interface FileListProps {
  files: FileType[]
  selectedFile: FileType | null
  onSelectFile: (file: FileType) => void
  isLoading?: boolean
}

export function FileList({ files, selectedFile, onSelectFile, isLoading = false }: FileListProps) {
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
      case "doc":
      case "docx":
      case "txt":
      case "md":
        return <FileTextIcon className="h-4 w-4" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon className="h-4 w-4" />
      case "js":
      case "ts":
      case "jsx":
      case "tsx":
      case "py":
      case "java":
      case "c":
      case "cpp":
      case "h":
      case "rs":
      case "go":
        return <CodeIcon className="h-4 w-4" />
      default:
        return <FileIcon className="h-4 w-4" />
    }
  }

  const getFileTypeBadgeClass = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return "file-badge-pdf"
      case "doc":
      case "docx":
        return "file-badge-doc"
      case "txt":
      case "md":
        return "file-badge-txt"
      case "js":
      case "ts":
      case "jsx":
      case "tsx":
      case "py":
      case "java":
      case "c":
      case "cpp":
      case "h":
      case "rs":
      case "go":
        return "file-badge-code"
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "file-badge-image"
      default:
        return ""
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="border-r bg-background/95 overflow-hidden">
      <div className="p-2 border-b">
        <h2 className="px-2 text-lg font-semibold">Results</h2>
        <p className="px-2 text-sm text-muted-foreground">
          {isLoading ? "Searching..." : `${files.length} files found`}
        </p>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)] scrollbar-thin">
        <div className="p-2 space-y-1">
          {isLoading
            ? // Show loading skeletons
              Array.from({ length: 5 }).map((_, i) => <LoadingFileItem key={i} />)
            : // Show actual files
              files.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-3 text-sm transition-colors cursor-pointer",
                    selectedFile?.id === file.id ? "bg-supabase-500 text-white" : "hover:bg-muted",
                  )}
                  onClick={() => onSelectFile(file)}
                >
                  <div className="mt-px">{getFileIcon(file.type)}</div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium leading-none truncate">{file.name}</p>
                      <span className="text-xs opacity-70 whitespace-nowrap ml-2">{formatDate(file.modified)}</span>
                    </div>
                    <p className="text-xs truncate opacity-70">{file.path}</p>
                    <div className="flex items-center gap-2">
                      <span className={cn("file-badge", getFileTypeBadgeClass(file.type))}>
                        {file.type.toUpperCase()}
                      </span>
                      {file.summary && (
                        <p className="text-xs truncate flex-1 opacity-70">{file.summary.substring(0, 60)}...</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </ScrollArea>
    </div>
  )
}
