import {useQuery} from "@tanstack/react-query";
import {api} from "../../utils/api.ts";
import {PotholeCategory} from "../../types/pothole/PotholeCategory.ts";

function usePotholeCategories() {
    return useQuery<PotholeCategory[]>({
        queryKey: ['potholeCategories'],
        queryFn: async () => {
            const { data } = await api.get<PotholeCategory[]>('/api/pothole-categories/list');
            return data;
        }
    });
}

export {usePotholeCategories};