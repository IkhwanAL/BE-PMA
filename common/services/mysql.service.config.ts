import { PrismaClient } from '@prisma/client';

let MysqlPrisma = new PrismaClient({
    log: ['error', 'query'],
});

export default MysqlPrisma;
