import { user } from '@prisma/client';

export interface RestApiGetUserById extends Partial<user> {}
