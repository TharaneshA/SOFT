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
    const result = await invoke<{ files: FileType[] }>("search_files", { query })
    return result.files
  } catch (error) {
    console.error("Failed to search files:", error)
    return []
  }
}
