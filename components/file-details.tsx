"use client"

import type { FileType } from "@/types/file"
import { FilePreview } from "@/components/file-preview"
import { LoadingFileDetails } from "@/components/loading-animation"

interface FileDetailsProps {
  file: FileType | null
  isLoading?: boolean
}

export function FileDetails({ file, isLoading = false }: FileDetailsProps) {
  if (isLoading) {
    return <LoadingFileDetails />
  }

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-muted-foreground">Select a file to view details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      <FilePreview file={file} />
    </div>
  )
}
