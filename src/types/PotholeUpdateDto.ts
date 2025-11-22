export interface PotholeUpdateDto {
    reportByCitizenId?: number | null;
    locationId?: number | null;
    categoryId?: number | null;
    statusId?: number | null;
    photoUrl?: string | null;
    dateValidated?: string | null;
    dateClosed?: string | null;
    isActive?: boolean | null;
}
