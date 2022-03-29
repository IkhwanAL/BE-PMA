export interface CreateUserDto {
    email: string;
    username: string;
    password: string;
    phoneNumber?: string;
    firstName?: string;
    lastName?: string;
    link?: string;
}
