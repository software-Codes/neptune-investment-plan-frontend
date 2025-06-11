import { apiClient } from './api-client'
import { Deposit } from '@/types/type'

export const depositApi = {
  /**
   * Fetch single deposit details
   */
  getDeposit: async (userId: string, depositId: string) => {
    return apiClient.get<Deposit>(`/api/v1/users/${userId}/deposits/${depositId}`)
  },
}

