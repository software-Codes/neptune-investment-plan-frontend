import { AdminLoginImage, NeptuneLogo } from "@/assets/images/Images"
import Image from "next/image"
import { ReactNode } from "react"


interface AuthAdminLayoutProps
{
    children: ReactNode
}


export default function AuthAdminLayout ({children}: AuthAdminLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">

                <Image src={NeptuneLogo } alt="logo"  className="size-4" /> 
              
            </div>
            Neptune Investment
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {children}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src={AdminLoginImage}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
