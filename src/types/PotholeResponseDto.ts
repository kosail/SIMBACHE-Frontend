export interface PotholeResponseDto {
    potholeId: number;
    reportByCitizenId: number | null;
    registeredByUserId: number;
    locationId: number;
    categoryId: number;
    statusId: number;
    photoUrl: string | null;
    dateReported: string;
    dateValidated: string | null;
    dateClosed: string | null;
    isActive: boolean;
}
