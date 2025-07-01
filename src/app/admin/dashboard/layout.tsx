import { ReactNode } from "react"
interface AdminDashboardLayoutProps {
    children: ReactNode
}

const AdminDashboardLayout = ({ children }: AdminDashboardLayoutProps) => {
    return (
        <div>{children}</div>
    )
}

export default AdminDashboardLayout;