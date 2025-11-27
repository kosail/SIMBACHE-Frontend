import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {PotholeResponseDto} from '../../types/pothole/PotholeResponseDto';
import {PotholeUpdateDto} from '../../types/pothole/PotholeUpdateDto';
import {api} from '../../utils/api';

function usePotholes() {
    return useQuery<PotholeResponseDto[]>({
        queryKey: ['potholes'],
        queryFn: async () => {
            const {data} = await api.get<PotholeResponseDto[]>('/api/potholes/active');
            return data;
        },
        refetchInterval: 2000,
    });
}

function useSinglePothole(id: number) {
    const queryClient = useQueryClient();

    const potholeQuery = useQuery<PotholeResponseDto>({
        queryKey: ['pothole', id],
        queryFn: async () => {
            const {data} = await api.get<PotholeResponseDto>(`/api/potholes/${id}`);
            return data;
        },
    });

    const updatePothole = useMutation({
        mutationFn: async (payload: PotholeUpdateDto) => {
            const {data} = await api.put<PotholeResponseDto>(`/api/potholes/update/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['pothole', id]});
            queryClient.invalidateQueries({queryKey: ['potholes']});
        },
    });

    return {...potholeQuery, updatePothole};
}

export {usePotholes, useSinglePothole};