import {useQuery} from "@tanstack/react-query";
import {api} from "../../../utils/api.ts";
import {Municipality} from "../../../types/geography/Municipality.ts";

function useMunicipalities(stateId: number) {
    return useQuery<Municipality[]>({
        queryKey: ['municiapalities', stateId],
        queryFn: async () => {
            const requestParams = { stateId: stateId }
            const { data } = await api.get<Municipality[]>('/api/geography/municipalities/list', { params: requestParams });
            return data;
        },
        enabled: !!stateId
    });
}

export {useMunicipalities};