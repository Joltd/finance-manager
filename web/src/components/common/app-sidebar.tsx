'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem,
  SidebarTrigger, useSidebar
} from "@/components/ui/sidebar";
import { AppearanceTrigger } from "@/components/ui/appearance-trigger";
import { PlusIcon, XIcon } from "lucide-react";
import { useImportDataStore } from "@/store/import-data";
import { useEffect } from "react";
import { ImportDataNewDialog } from "@/components/import-data/import-data-new-dialog";
import { useRequest } from "@/hooks/use-request";
import { importDataUrls } from "@/api/import-data";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { importDataList, setNewDialogOpened } = useImportDataStore()
  const { submit } = useRequest(importDataUrls.id, { method: 'DELETE' })

  useEffect(() => {
    importDataList.fetch()
  }, []);

  const handleNewImport = () => {
    setNewDialogOpened(true)
  }

  const handleDelete = async (id: string) => {
    await submit({}, { id })
    importDataList.fetch()
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center">
        <SidebarTrigger />
        <a href="/" className={cn("text-lg text-nowrap overflow-hidden")}>Finance manager</a>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Import</SidebarGroupLabel>
          <SidebarGroupAction onClick={handleNewImport}>
            <PlusIcon />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {importDataList.data?.map((it) => (
                <SidebarMenuItem key={it.id}>
                  <SidebarMenuButton asChild>
                    <a href={`/import-data/${it.id}`}>
                      <span>{it.name}</span>
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuAction 
                    showOnHover 
                    onClick={() => handleDelete(it.id)}
                  >
                    <XIcon />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          <ImportDataNewDialog />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <AppearanceTrigger />
      </SidebarFooter>
    </Sidebar>
  )
}
