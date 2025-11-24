export interface PotholeResponseDto {
    potholeId: number;
    reportByCitizenId: number | null;
    registeredByUser: {
        firstName: string;
        lastName: string;
        roleName: string;
    };
    location: {
        stateName: string;
        municipalityName: string;
        localityName: string;
        coloniaName: string;
        postalCode: number;
        mainStreetName: string;
        streetOneName: string;
        streetTwoName: string;
    };
    category: {
        categoryName: string;
        description: string;
        priorityLevel: number;
    };
    status: string;
    photoUrl: string | null;
    dateReported: string;
    dateValidated: string | null;
    dateClosed: string | null;
    isActive: boolean;
}
