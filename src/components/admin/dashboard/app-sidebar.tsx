"use client"
import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconListDetails,
  IconNotification,
  IconSettings,
  IconSettings2,
  IconUsers,
} from "@tabler/icons-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NeptuneLogo } from "@/assets/images/Images"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import Image from "next/image"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  adminId?: string
}
 

export function AppSidebar({ adminId = "default", ...props }: AppSidebarProps) {
  const pathname = usePathname()


  const data = {
    user: {
      name: "Collins Munene",
      email: "collins@gmail.com",
      avatar: NeptuneLogo.src
    },
    navMain: [
      {
        title: "Users",
        url: "/admin/dashboard/users",
        icon: IconListDetails,
      },
      {
        title: "Investments",
        url: `/admin/dashboard/investment/`,
        icon: IconChartBar,
      },
      {
        title: "Deposits",
        url: `/admin/dashboard/deposits`,
        icon: IconFolder,
      },
      {
        title: "Withdrawals",
        url: `/admin/dashboard/withdrawals`,
        icon: IconUsers,
      },
      {
        title: "Settings",
        url: `/admin/dashboard/settings`,
        icon: IconSettings2
      },
      {
        title: "Notifications",
        url: `/admin/dashboard/notifications`,
        icon: IconNotification
      }
    ],
  }

  // Function to check if a nav item is active
  const isActiveRoute = (url: string) => {
    // Handle exact matches
    if (pathname === url) return true

    // Handle dynamic routes and partial matches
    const urlSegments = url.split('/').filter(Boolean)
    const pathSegments = pathname.split('/').filter(Boolean)

    // For routes with trailing slash, remove it for comparison
    const cleanUrl = url.replace(/\/$/, '')
    const cleanPath = pathname.replace(/\/$/, '')

    return cleanPath.startsWith(cleanUrl) || pathname.startsWith(url)
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href={`/admin/dashboard/`}>
                <Image src={NeptuneLogo} alt="logo" className="!size-8 rounded-full" />
                <span className="text-base font-semibold">Neptune</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} currentPath={pathname} isActiveRoute={isActiveRoute} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser  />
      </SidebarFooter>
    </Sidebar>
  )
}