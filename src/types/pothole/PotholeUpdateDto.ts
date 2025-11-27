export interface PotholeUpdateDto {
    reportByCitizenId?: number | null;
    locationId?: bigint | number | null;
    categoryId?: number | null;
    statusId?: number | null;
    photoUrl?: string | null;
    dateValidated?: string | null;
    dateClosed?: string | null;
    isActive?: boolean | null;
}
