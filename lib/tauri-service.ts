"use client"

import { invoke } from "@tauri-apps/api/tauri"
import type { FileType } from "@/types/file"

const isTauri = typeof window !== "undefined" && "__TAURI__" in window

export async function getIndexedFolders(): Promise<string[]> {
  try {
    return await invoke<string[]>("get_indexed_folders")
  } catch (error) {
    console.error("Failed to get indexed folders:", error)
    return []
  }
}

export async function addIndexedFolder(folderPath: string): Promise<boolean> {
  try {
    await invoke("add_indexed_folder", { folderPath })
    return true
  } catch (error) {
    console.error("Failed to add indexed folder:", error)
    return false
  }
}

export async function removeIndexedFolder(folderPath: string): Promise<boolean> {
  try {
    await invoke("remove_indexed_folder", { folderPath })
    return true
  } catch (error) {
    console.error("Failed to remove indexed folder:", error)
    return false
  }
}

export async function searchFiles(query: string): Promise<FileType[]> {
  try {
    // Use the Tauri command to search files
    const result = await invoke<{ files: FileType[]; total: number; query_time_ms: number }>("search_files", { query })
    
    // Convert the modified date strings to Date objects
    const files = result.files.map(file => ({
      ...file,
      modified: new Date(file.modified)
    }))
    
    return files
  } catch (error) {
    console.error("Failed to search files:", error)
    return []
  }
}
