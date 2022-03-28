export interface PutUserDto {
    id?: number;
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
}
