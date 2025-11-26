import {useQuery, useQueryClient} from "@tanstack/react-query";
import {PotholeResponseDto} from "../../types/pothole/PotholeResponseDto.ts";
import {api} from "../../utils/api.ts";

function usePotholes() {
    return useQuery<PotholeResponseDto[]>({
        queryKey: ['potholes'],
        queryFn: async () => {
            const { data } = await api.get<PotholeResponseDto[]>('/api/potholes/active');
            return data;
        },
        refetchInterval: 2000
    });
}

function useSinglePothole(id: number) {
    return useQuery<PotholeResponseDto>({
        queryKey: ['pothole', id],
        queryFn: async () => {
            const { data } = await api.get<PotholeResponseDto>(`/api/potholes/${id}`);
            return data;
        }
    });
}

export {usePotholes, useSinglePothole};