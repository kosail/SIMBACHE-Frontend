import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { CitizenLookupDto } from '../../types/citizen/CitizenLookupDto';
import {AxiosError} from "axios";

interface UseCitizenLookupOptions {
    phoneNumber: number | undefined;
    enabled?: boolean;
}

export function useCitizenLookup({ phoneNumber, enabled = true }: UseCitizenLookupOptions) {
    return useQuery<CitizenLookupDto | null>({
        queryKey: ['citizen-lookup', phoneNumber],
        queryFn: async () => {
            if (!phoneNumber) return null;

            try {
                const response = await api.get<CitizenLookupDto>(
                    `/api/citizens/lookup?phoneNumber=${phoneNumber}`
                );
                return response.data;
            } catch (error: unknown) {
                // 404 means citizen not found - this is expected, not an error
                if (error instanceof AxiosError && error?.response?.status === 404) {
                    return null;
                }
                throw error;
            }
        },
        enabled: enabled && phoneNumber !== undefined && phoneNumber > 0,
        staleTime: 30_000, // Cache for 30 seconds
        retry: false, // Don't retry on 404
    });
}