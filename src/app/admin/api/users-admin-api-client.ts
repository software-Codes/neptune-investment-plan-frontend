
import { ApiResponse } from "@/types/admin/admin.types";
import { adminAxios } from "./admin-axios";

export interface AdminUser {
  userId: string;
  fullName: string;
  email: string;
  accountStatus: 'active' | 'suspended' | 'deactivated';
  accountBalance: string;
  tradingBalance: string;
  referralBalance: string;
  createdAt: string;
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

  /* ---------- BLOCK / UNBLOCK ---------- */
  async block(userId: string, reason?: string) {
    await adminAxios.patch(`/users/${userId}/block`, { reason });
  }

  async unblock(userId: string) {
    await adminAxios.patch(`/users/${userId}/unblock`);
  }

  /* ---------- FORCE LOGOUT ---------- */
  async forceLogout(userId: string) {
    await adminAxios.post(`/users/${userId}/force-logout`);
  }

  /* ---------- DELETE (soft/hard) ---------- */
  async remove(userId: string, soft = false) {
    await adminAxios.delete(`/users/${userId}`, { params: { soft } });
  }
}

export const usersAdminApiClient = new UsersAdminApiClient();
