import {apiClient} from '@/lib/api/api-client'
import {Investment} from "@/types/investments/investments.types";
import assert from "node:assert";


export const investmentsClient =
    {
        list: async (userId: string) => {
            const { data } = await apiClient.get<Investment[]>(
                `/api/v1/users/${userId}/investments`,
            );
            return data;
        },
        get: async (userId: string, investmentId: string) => {
            const { data } = await apiClient.get<Investment>(
                `/api/v1/users/${userId}/investments/${investmentId}`,
            );
            return data;
        },
        create: async (
            userId: string,
            payload: { amount: number },
        ) => {
            const { data } = await apiClient.post<Investment>(
                `/api/v1/users/${userId}/investments`,
                payload,
            );
            return data;
        },
        cancel: async(userId: string, investmentId: string) =>
{
            assert(investmentId, 'Investment ID is required to cancel an investment');
            const { data } = await apiClient.delete<Investment>(
                `/api/v1/users/${userId}/investments/${investmentId}`,
            );
            return data;

}
    }