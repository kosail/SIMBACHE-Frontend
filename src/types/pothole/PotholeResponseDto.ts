export interface PotholeResponseDto {
    potholeId: number;
    reporterCitizen: {
        citizenId: number;
        firstName: string;
        middleName: string;
        lastName: string;
        secondLastName: string;
        email: string;
        phoneNumber: bigint;
    } | null;
    registeredByUser: {
        firstName: string;
        lastName: string;
        roleName: string;
    };
    location: {
        locationId: bigint | number;
        state: {
            stateId: number;
            stateName: string;
        };
        municipality: {
            municipalityId: number;
            municipalityName: string;
        };
        locality: {
            localityId: number;
            localityName: string;
        };
        postalCode: number;
        mainStreet: {
            streetId: number;
            streetName: string;
        };
        streetOne: {
            streetId: number;
            streetName: string;
        } | null;
        streetTwo: {
            streetId: number;
            streetName: string;
        } | null;
    };
    category: {
        categoryId: number;
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
