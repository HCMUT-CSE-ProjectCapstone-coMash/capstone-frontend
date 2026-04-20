export type Employee = {
    id: string;
    employeeId: string;
    fullName: string;
    gender: string;
    dateOfBirth: string;
    phoneNumber: string;
    email: string;
    imageURL?: string;
};

export type CreateEmployeePayload = {
    fullName: string,
    gender: string,
    dateOfBirth: string,
    phoneNumber: string,
    email: string,
    image: File | null,
}

export type UpdateEmployeePayload = {
    fullName?: string,
    gender?: string,
    dateOfBirth?: string,
    phoneNumber?: string,
    email?: string
}