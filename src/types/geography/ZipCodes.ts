export interface ZipCodeLookupDto {
    stateId: number;
    municipalityId: number;
    localityId: number;
    postalCode: number;
    stateName: string;
    municipalityName: string;
    localityName: string;
}

export interface ZipCodeByLocationArgs {
    stateId?: number | null;
    municipalityId?: number | null;
    localityId?: number | null;
    enabled?: boolean;
}

export interface LocationsByZipArgs {
    postalCode?: number;
    enabled?: boolean;
}