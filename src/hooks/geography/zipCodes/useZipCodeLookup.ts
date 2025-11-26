import {useQuery} from '@tanstack/react-query';
import {LocationsByZipArgs, ZipCodeByLocationArgs, ZipCodeLookupDto} from "../../../types/geography/ZipCodes.ts";
import {api} from '../../../utils/api';

export function useZipCodeByLocation({
    stateId,
    municipalityId,
    localityId,
    enabled = true,
}: ZipCodeByLocationArgs) {
    return useQuery<ZipCodeLookupDto>({
        queryKey: ['zipCodeByLocation', stateId, municipalityId, localityId],
        queryFn: async () => {
            const {data} = await api.get<ZipCodeLookupDto>('/api/geography/zipcode/reverse-lookup', {
                params: {
                    stateId,
                    municipalityId,
                    localityId,
                },
            });

            return data;
        },
        enabled: Boolean(enabled && stateId && municipalityId && localityId),
        staleTime: 5 * 60 * 1000,
    });
}

export function useLocationsByZipCode({
    postalCode,
    enabled = true,
}: LocationsByZipArgs) {
    return useQuery<ZipCodeLookupDto[]>({
        queryKey: ['locationsByZipCode', postalCode],
        queryFn: async () => {
            const {data} = await api.get<ZipCodeLookupDto[]>('/api/geography/zipcode/lookup', {
                params: {postalCode},
            });

            return data;
        },
        enabled: Boolean(enabled && postalCode),
        staleTime: 5 * 60 * 1000,
    });
}