import { PrismaClient } from '@prisma/client';

// class MysqlPrisma {
//     private static Prisma: PrismaClient;

//     private constructor() {
//         MysqlPrisma.Prisma = new PrismaClient({
//             log: ['query', 'info', 'warn', 'error'],
//         });
//     }

//     /**
//      * Get Connection
//      */
//     public static PrismaMysql() {
//         if (!MysqlPrisma.Prisma) {
//             MysqlPrisma.ConnectionPrisma();
//         }

//         return MysqlPrisma.Prisma;
//     }

//     private static ConnectionPrisma() {
//         MysqlPrisma.Prisma = new PrismaClient({

//         });
//     }

//     private static async CloseConnection() {
//         await MysqlPrisma.Prisma.$disconnect();
//     }
// }

let MysqlPrisma = new PrismaClient({
    log: ['query', 'error'],
});

export default MysqlPrisma;
