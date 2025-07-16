import { AppSidebar } from "@/components/admin/dashboard/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react"
interface AdminDashboardLayoutProps {
    children: ReactNode
}

const AdminDashboardLayout = ({ children }: AdminDashboardLayoutProps) => {
    return (
        <div className="flex  ">
            <SidebarProvider>
                  <AppSidebar />
            {children}
            </SidebarProvider>
          
            </div>
    )
}

export default AdminDashboardLayout;