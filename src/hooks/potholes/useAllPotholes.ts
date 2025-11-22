import {useQuery} from "@tanstack/react-query";
import {PotholeResponseDto} from "../../types/PotholeResponseDto.ts";
import {api} from "../../utils/api.ts";

function useAllPotholes() {
    return useQuery<PotholeResponseDto[]>({
        queryKey: ['potholes'],
        queryFn: async () => {
            const { data } = await api.get<PotholeResponseDto[]>('/api/potholes/active');
            return data;
        }
    });
}

export {useAllPotholes};