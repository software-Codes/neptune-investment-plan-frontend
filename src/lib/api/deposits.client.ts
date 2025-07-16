import { Deposit } from '@/types/deposits.types';
import { apiClient } from './api-client';

export const depositsClient = {
  async list(userId: string) {
    const { data } = await apiClient.get<Deposit[]>(
      `/api/v1/users/${userId}/deposits`
    );
    return data;
  },
  async get(userId: string, depositId: string) {
    const { data } = await apiClient.get<Deposit>(
      `/api/v1/users/${userId}/deposits/${depositId}`
    );
    return data;
  },
  async create(userId: string, payload: Pick<Deposit, 'amount' | 'txHash'>) {
    const { data } = await apiClient.post<Deposit>(
      `/api/v1/users/${userId}/deposits`,
      payload
    );  
    return data;
  },
};
