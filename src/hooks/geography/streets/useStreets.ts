import {useQuery} from "@tanstack/react-query";
import {api} from "../../../utils/api.ts";
import {Street} from "../../../types/geography/Street.ts";

function useStreetsPerLocality(localityId: number) {
    return useQuery<Street[]>({
        queryKey: ['streetsPerLocality', localityId],
        queryFn: async () => {
            const requestParams = { localityId: localityId }
            const { data } = await api.get<Street[]>('/api/geography/streets/list/by-locality', { params: requestParams });
            return data;
        },
        enabled: !!localityId
    });
}

function useStreetsPerColonia(coloniaId: number) {
    return useQuery<Street[]>({
        queryKey: ['streetsPerColonia', coloniaId],
        queryFn: async () => {
            const requestParams = { coloniaId: coloniaId }
            const { data } = await api.get<Street[]>('/api/geography/streets/list/by-colonia', { params: requestParams });
            return data;
        },
        enabled: !!coloniaId
    });
}

export {useStreetsPerLocality, useStreetsPerColonia};