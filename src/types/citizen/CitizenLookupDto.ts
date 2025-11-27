export interface CitizenLookupDto {
    citizenId: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    secondLastName: string | null;
    fullName: string;
    email: string;
    phoneNumber: number;
}