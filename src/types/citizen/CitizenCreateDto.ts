export interface CitizenCreateDto {
    firstName: string;
    middleName?: string | null;
    lastName: string;
    secondLastName?: string | null;
    email: string;
    phoneNumber?: number | null;
    registeredLocationId: number;
}