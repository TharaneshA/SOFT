"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ResizableSidebarProps {
  children: React.ReactNode
  className?: string
  minWidth?: number
  maxWidth?: number
  defaultWidth?: number
  id?: string
}

export function ResizableSidebar({
  children,
  className,
  minWidth = 240,
  maxWidth = 480,
  defaultWidth = 320,
  id,
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(defaultWidth)

  useEffect(() => {
    // Try to load saved width from localStorage
    const savedWidth = localStorage.getItem(`sidebar-width-${id || "default"}`)
    if (savedWidth) {
      const parsedWidth = Number.parseInt(savedWidth, 10)
      if (!isNaN(parsedWidth) && parsedWidth >= minWidth && parsedWidth <= maxWidth) {
        setWidth(parsedWidth)
      }
    }
  }, [id, minWidth, maxWidth])

  const startResizing = (e: React.MouseEvent<HTMLDivElement>) => {
    startXRef.current = e.clientX
    startWidthRef.current = width
    setIsResizing(true)
  }

  const stopResizing = () => {
    if (isResizing) {
      setIsResizing(false)
      // Save width to localStorage
      localStorage.setItem(`sidebar-width-${id || "default"}`, width.toString())
    }
  }

  const resize = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = startWidthRef.current + (e.clientX - startXRef.current)
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth)
      }
    }
  }

  useEffect(() => {
    window.addEventListener("mousemove", resize)
    window.addEventListener("mouseup", stopResizing)
    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [isResizing])

  return (
    <div
      ref={sidebarRef}
      className={cn("relative flex-shrink-0 border-r overflow-hidden", className)}
      style={{ width: `${width}px` }}
    >
      {children}
      <div className="resizer" onMouseDown={startResizing} />
    </div>
  )
}
