import {useQuery} from "@tanstack/react-query";
import {api} from "../../../utils/api.ts";
import {GeoState} from "../../../types/geography/GeoState.ts";

function useGeoStates() {
    return useQuery<GeoState[]>({
        queryKey: ['geostates'],
        queryFn: async () => {
            const { data } = await api.get<GeoState[]>('/api/geography/states/list');
            return data;
        }
    });
}

export {useGeoStates};