export interface Location {
    stateId: number;
    municipalityId: number;
    localityId: number;
    mainStreetId: number;
    streetOneId?: number | null;
    streetTwoId?: number | null;
}