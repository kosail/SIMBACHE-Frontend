import {useQuery} from "@tanstack/react-query";
import {api} from "../../../utils/api.ts";
import {Colonia} from "../../../types/geography/Colonia.ts";

function useColonias(localityId: number) {
    return useQuery<Colonia[]>({
        queryKey: ['colonias', localityId],
        queryFn: async () => {
            const requestParams = { localityId: localityId }
            const { data } = await api.get<Colonia[]>('/api/geography/colonias/list', { params: requestParams });
            return data;
        },
        enabled: !!localityId
    });
}

export {useColonias};