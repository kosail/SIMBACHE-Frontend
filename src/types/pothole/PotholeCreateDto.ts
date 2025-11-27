export interface PotholeCreateDto {
    /** Optional: citizen id that reported it; null when reported by an employee */
    reporterCitizenId?: number | null;

    locationId: number;
    categoryId: number;
    statusId: number;
    photoUrl?: string | null;

    /** Optional; if omitted or null, backend sets LocalDateTime.now() */
    dateReported?: string | null;
}
