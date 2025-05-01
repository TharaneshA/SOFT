"use client"

import { useState } from "react"
import type { FileType } from "@/types/file"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Info, Download, ExternalLink, Copy, Code, FileText } from "lucide-react"

interface FilePreviewProps {
  file: FileType
}

export function FilePreview({ file }: FilePreviewProps) {
  const [activeTab, setActiveTab] = useState<string>("preview")

  const renderPreview = () => {
    switch (file.type.toLowerCase()) {
      case "pdf":
        return <PDFPreview file={file} />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImagePreview file={file} />
      case "md":
        return <MarkdownPreview file={file} />
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
        return <CodePreview file={file} />
      default:
        return <TextPreview file={file} />
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="preview" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
        <div className="border-b px-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="preview" className="data-[state=active]:bg-muted">
                <FileText className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="info" className="data-[state=active]:bg-muted">
                <Info className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" title="Copy content">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Download file">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Open in default app">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="preview" className="flex-1 p-0 m-0">
          {renderPreview()}
        </TabsContent>

        <TabsContent value="info" className="flex-1 p-0 m-0">
          <FileInfo file={file} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PDFPreview({ file }: { file: FileType }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-muted/30">
      <div className="w-full max-w-md aspect-[3/4] bg-white rounded-md shadow-md p-6 flex flex-col">
        <div className="w-16 h-16 mx-auto mb-4 text-red-500">
          <FileText className="w-full h-full" />
        </div>
        <div className="text-center text-black">
          <h3 className="font-bold text-lg mb-1">{file.name}</h3>
          <p className="text-sm text-gray-600 mb-4">PDF Document</p>
          <p className="text-sm text-gray-800">{file.summary}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">PDF preview is not available in this environment</p>
    </div>
  )
}

function ImagePreview({ file }: { file: FileType }) {
  return (
    <div className="h-full flex items-center justify-center p-8 bg-muted/30">
      <div className="text-center">
        <div className="w-64 h-64 mx-auto mb-4 bg-background rounded-md border flex items-center justify-center">
          <img
            src={`/placeholder.svg?height=200&width=200&text=${file.name}`}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <h3 className="font-medium">{file.name}</h3>
        <p className="text-sm text-muted-foreground">Image preview</p>
      </div>
    </div>
  )
}

function MarkdownPreview({ file }: { file: FileType }) {
  return (
    <ScrollArea className="h-full">
      <div className="p-6 prose dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: `<p>${file.content.replace(/\n/g, "<br/>")}</p>` }} />
      </div>
    </ScrollArea>
  )
}

function CodePreview({ file }: { file: FileType }) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="relative">
          <pre className="p-4 rounded-md bg-muted overflow-x-auto">
            <code className="text-sm font-mono">{file.content}</code>
          </pre>
        </div>
      </div>
    </ScrollArea>
  )
}

function TextPreview({ file }: { file: FileType }) {
  return (
    <ScrollArea className="h-full">
      <div className="p-6 whitespace-pre-wrap font-mono text-sm">{file.content}</div>
    </ScrollArea>
  )
}

function FileInfo({ file }: { file: FileType }) {
  const formatDate = (date: Date) => {
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getFileTypeIcon = () => {
    switch (file.type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-6 w-6 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-6 w-6 text-blue-500" />
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
        return <Code className="h-6 w-6 text-purple-500" />
      default:
        return <FileText className="h-6 w-6" />
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-muted rounded-md">{getFileTypeIcon()}</div>
          <div>
            <h3 className="font-medium text-lg">{file.name}</h3>
            <p className="text-sm text-muted-foreground">{file.path}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">File Type</h4>
            <p className="text-sm">{file.type.toUpperCase()} File</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Last Modified</h4>
            <p className="text-sm">{formatDate(file.modified)}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Summary</h4>
            <p className="text-sm">{file.summary}</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
