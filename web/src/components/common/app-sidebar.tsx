'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { AppearanceTrigger } from "@/components/ui/appearance-trigger";
import { PlusIcon } from "lucide-react";
import { useImportDataStore } from "@/store/import-data";
import { useEffect } from "react";
import { ImportDataNewDialog } from "@/components/import-data/import-data-new-dialog";

export function AppSidebar() {
  const { importDataList, setNewDialogOpened } = useImportDataStore()

  useEffect(() => {
    importDataList.fetch()
  }, []);

  const handleNewImport = () => {
    setNewDialogOpened(true)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center">
        <SidebarTrigger />
        {/*<div className="text-lg">Finance manager</div>*/}
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