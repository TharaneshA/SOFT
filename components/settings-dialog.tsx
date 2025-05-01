"use client"

import { useState, useEffect } from "react"
import { FolderIcon, PlusIcon, TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { getIndexedFolders, addIndexedFolder, removeIndexedFolder } from "@/lib/tauri-service"
import { useToast } from "@/hooks/use-toast"

export function SettingsDialog() {
  const [folders, setFolders] = useState<string[]>([])
  const [newFolder, setNewFolder] = useState("")
  const [useCloud, setUseCloud] = useState(false)
  const [useGithub, setUseGithub] = useState(false)
  const [useGoogleDocs, setUseGoogleDocs] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadFolders()
  }, [])

  const loadFolders = async () => {
    try {
      const indexedFolders = await getIndexedFolders()
      setFolders(indexedFolders)
    } catch (error) {
      console.error("Failed to load folders:", error)
      setFolders(["/Users/ashwa/Documents", "/Users/ashwa/Desktop"])
    }
  }

  const handleAddFolder = async () => {
    if (!newFolder) return

    setIsLoading(true)

    try {
      const success = await addIndexedFolder(newFolder)

      if (success) {
        setFolders([...folders, newFolder])
        setNewFolder("")
        toast({
          title: "Folder added",
          description: `${newFolder} has been added to indexed folders.`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to add folder.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to add folder:", error)
      toast({
        title: "Error",
        description: "Failed to add folder.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFolder = async (index: number) => {
    const folderToRemove = folders[index]

    setIsLoading(true)

    try {
      const success = await removeIndexedFolder(folderToRemove)

      if (success) {
        setFolders(folders.filter((_, i) => i !== index))
        toast({
          title: "Folder removed",
          description: `${folderToRemove} has been removed from indexed folders.`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to remove folder.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to remove folder:", error)
      toast({
        title: "Error",
        description: "Failed to remove folder.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Settings</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure which folders to index and search options.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folders">Indexed Folders</Label>
            <div className="space-y-2">
              {folders.map((folder, index) => (
                <div key={index} className="flex items-center gap-2">
                  <FolderIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{folder}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveFolder(index)} disabled={isLoading}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                id="newFolder"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                placeholder="Add folder path..."
                disabled={isLoading}
              />
              <Button onClick={handleAddFolder} size="icon" disabled={isLoading || !newFolder}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Cloud Integrations</Label>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="cloud">Enable Cloud Features</Label>
                <p className="text-sm text-muted-foreground">Use cloud services for enhanced search capabilities</p>
              </div>
              <Switch id="cloud" checked={useCloud} onCheckedChange={setUseCloud} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="github">GitHub Integration</Label>
                <p className="text-sm text-muted-foreground">Index and search your GitHub repositories</p>
              </div>
              <Switch id="github" checked={useGithub} onCheckedChange={setUseGithub} disabled={!useCloud} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="gdocs">Google Docs Integration</Label>
                <p className="text-sm text-muted-foreground">Index and search your Google Docs</p>
              </div>
              <Switch id="gdocs" checked={useGoogleDocs} onCheckedChange={setUseGoogleDocs} disabled={!useCloud} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
