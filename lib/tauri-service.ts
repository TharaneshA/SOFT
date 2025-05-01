"use client"

import { mockFiles } from "@/lib/mock-data"
import type { FileType } from "@/types/file"

// Check if we're running in a Tauri environment
const isTauri = typeof window !== "undefined" && "Tauri" in window

// Mock indexed folders for preview
const mockIndexedFolders = ["/Users/ashwa/Documents", "/Users/ashwa/Desktop"]

export async function getIndexedFolders(): Promise<string[]> {
  try {
    if (isTauri) {
      // This would use the actual Tauri invoke in a real Tauri app
      // const { invoke } = await import("@tauri-apps/api/tauri")
      // return await invoke("get_indexed_folders")
      console.log("Would call Tauri API in desktop app")
    }
    // Fallback to mock data when not in Tauri environment
    return mockIndexedFolders
  } catch (error) {
    console.error("Failed to get indexed folders:", error)
    return mockIndexedFolders
  }
}

export async function addIndexedFolder(folderPath: string): Promise<boolean> {
  try {
    if (isTauri) {
      // This would use the actual Tauri invoke in a real Tauri app
      // const { invoke } = await import("@tauri-apps/api/tauri")
      // await invoke("add_indexed_folder", { folderPath })
      console.log("Would call Tauri API in desktop app")
    }
    // For preview, just simulate success
    return true
  } catch (error) {
    console.error("Failed to add indexed folder:", error)
    return false
  }
}

export async function removeIndexedFolder(folderPath: string): Promise<boolean> {
  try {
    if (isTauri) {
      // This would use the actual Tauri invoke in a real Tauri app
      // const { invoke } = await import("@tauri-apps/api/tauri")
      // await invoke("remove_indexed_folder", { folderPath })
      console.log("Would call Tauri API in desktop app")
    }
    // For preview, just simulate success
    return true
  } catch (error) {
    console.error("Failed to remove indexed folder:", error)
    return false
  }
}

export async function searchFiles(query: string): Promise<FileType[]> {
  try {
    if (isTauri) {
      // This would use the actual Tauri invoke in a real Tauri app
      // const { invoke } = await import("@tauri-apps/api/tauri")
      // const files = (await invoke("search_files", { query })) as any[]
      // return files.map((file) => ({
      //   id: file.id,
      //   name: file.name,
      //   path: file.path,
      //   type: file.file_type,
      //   summary: file.summary,
      //   content: file.content,
      //   modified: new Date(file.modified),
      // }))
      console.log("Would call Tauri API in desktop app")
    }

    // Fallback to client-side filtering for preview
    if (!query) return mockFiles

    return mockFiles.filter(
      (file) =>
        file.name.toLowerCase().includes(query.toLowerCase()) ||
        file.content.toLowerCase().includes(query.toLowerCase()) ||
        file.summary.toLowerCase().includes(query.toLowerCase()),
    )
  } catch (error) {
    console.error("Failed to search files:", error)
    return []
  }
}
