export interface CreateUserDto {
    id?: number;
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    link?: string;
}
