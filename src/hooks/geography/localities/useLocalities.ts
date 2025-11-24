import {useQuery} from "@tanstack/react-query";
import {api} from "../../../utils/api.ts";
import {Locality} from "../../../types/geography/Locality.ts";

function useLocalities(municipalityId: number) {
    return useQuery<Locality[]>({
        queryKey: ['localities', municipalityId],
        queryFn: async () => {
            const requestParams = { municipalityId: municipalityId }
            const { data } = await api.get<Locality[]>('/api/geography/localities/list', { params: requestParams });
            return data;
        },
        enabled: !!municipalityId
    });
}

export {useLocalities};