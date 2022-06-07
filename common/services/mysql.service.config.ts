import { PrismaClient } from '@prisma/client';

let MysqlPrisma = new PrismaClient({
    log: ['error'],
});

export default MysqlPrisma;
