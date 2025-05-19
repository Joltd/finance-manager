import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { AppearanceTrigger } from "@/components/ui/appearance-trigger";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center">
        <SidebarTrigger />
        {/*<div className="text-lg">Finance manager</div>*/}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <AppearanceTrigger />
      </SidebarFooter>
    </Sidebar>
  )
}