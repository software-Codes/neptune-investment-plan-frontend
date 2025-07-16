"use client"

import { useEffect, useState } from "react"
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { adminApiClient } from "@/app/admin/api/auth-api/auth-admin-api-client"
import { AdminProfile } from "@/types/admin/admin.types"

export function NavUser() {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isMobile } = useSidebar()

  // Fetch admin profile on component mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const profile = await adminApiClient.getProfile()
        setAdminProfile(profile)
      } catch (error) {
        console.error("Failed to fetch admin profile:", error)
        // If profile fetch fails, redirect to login
        adminApiClient.logout()
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminProfile()
  }, [])

  const handleLogout = async () => {
    await adminApiClient.logout()
  }

  // Function to extract initials from full name
  const getInitials = (fullName: string): string => {
    if (!fullName || fullName.trim() === '') return 'A'
    
    const names = fullName.trim().split(' ')
    
    if (names.length === 1) {
      // If only one name, return first letter
      return names[0].charAt(0).toUpperCase()
    }
    
    // Return first letter of first name and first letter of last name
    const firstInitial = names[0].charAt(0).toUpperCase()
    const lastInitial = names[names.length - 1].charAt(0).toUpperCase()
    
    return `${firstInitial}${lastInitial}`
  }

  // Show loading state while fetching profile
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="pointer-events-none">
            <Avatar className="h-8 w-8 rounded-lg grayscale">
              <AvatarFallback className="rounded-lg bg-muted animate-pulse">
                <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 w-20 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted-foreground/20 rounded animate-pulse mt-1" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Handle case where profile is not available
  if (!adminProfile) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="pointer-events-none">
            <Avatar className="h-8 w-8 rounded-lg grayscale">
              <AvatarFallback className="rounded-lg bg-destructive text-destructive-foreground">
                !
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-destructive">Error</span>
              <span className="text-muted-foreground truncate text-xs">
                Profile not found
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const userInitials = getInitials(adminProfile.fullName)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage
                  src={adminProfile.fullName}
                  alt={adminProfile.fullName}
                />
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {adminProfile.fullName}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {adminProfile.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={adminProfile.fullName}
                    alt={adminProfile.fullName}
                  />
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {adminProfile.fullName }
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {adminProfile.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}