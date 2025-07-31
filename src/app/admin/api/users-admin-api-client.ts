import { ApiResponse } from "@/types/admin/admin.types";
import { adminAxios } from "./admin-axios";

export interface AdminUser {
  user_id: string;
  full_name: string;
  email: string;
  account_status: 'active' | 'suspended' | 'deactivated';
  account_balance: string;
  trading_balance: string;
  referral_balance: string;
  created_at: string;
}

export interface PaginatedUsers {
  items: AdminUser[];
  total: number;
  page: number; 
  size: number;
}

class UsersAdminApiClient {
  /* ---------- FETCH LIST ---------- */
  async list(
    page = 1,
    size = 25,
    status?: string,
    search?: string,
  ): Promise<PaginatedUsers> {
    const { data } = await adminAxios.get<ApiResponse<PaginatedUsers>>('/users', {
      params: { page, size, status, search },
    });
    return data.data;
  }

  async block(userId: string, reason = 'Admin action') {
    await adminAxios.patch(`/users/${userId}/block`, { reason });
  }

  async unblock(userId: string) {
    await adminAxios.patch(`/users/${userId}/unblock`);
  }

  async forceLogout(userId: string) {
    await adminAxios.post(`/users/${userId}/force-logout`);
  }

  async remove(userId: string, soft = false) {
    await adminAxios.delete(`/users/${userId}`, { 
      params: { soft: soft.toString() } 
    });
  }

  async get(userId: string): Promise<AdminUser> {
    const res = await adminAxios.get<ApiResponse<AdminUser>>(`/users/${userId}`);
    return res.data.data;
  }
}

export const usersAdminApiClient = new UsersAdminApiClient();