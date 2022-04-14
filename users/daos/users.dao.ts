import debug from 'debug';
import { CreateUserDto } from '../dto/create.user.dto';
import { PatchUserDto } from '../dto/patch.user.dto';
import MysqlPrisma from '../../common/services/mysql.service.config';
import { Prisma } from '@prisma/client';

const log: debug.IDebugger = debug('app:in-memory-dao');

class UserDao {
    constructor() {
        log('Users Dao Initilailzed');
    }

    async getUser() {
        return MysqlPrisma.user.findMany();
    }

    async getUsersById(id: number, isActive = true) {
        return MysqlPrisma.user.findFirst({
            where: {
                id: id,
                isActive: isActive,
            },
        });
    }

    async addUser(resource: CreateUserDto) {
        const { link, ...user } = resource;
        return MysqlPrisma.user.create({
            data: {
                ...user,
                createdAt: new Date(),
                updatedAt: new Date(),
                link: {
                    create: [{ description: link }],
                },
            },
            include: {
                link: true,
            },
        });
    }

    async patchUserById(id: number, resource: PatchUserDto) {
        return MysqlPrisma.user.update({
            where: {
                id: id,
            },
            data: {
                ...resource,
                updatedAt: new Date(),
            },
        });
    }

    async getUserByEmail(email: string, isActive: boolean = null) {
        let where: Prisma.userWhereInput = {
            email: email,
        };

        if (isActive != null) {
            where = { ...where, isActive: isActive };
        }
        return MysqlPrisma.user.findFirst({
            where: {
                ...where,
            },
        });
    }

    async patchActiveUser(email: string) {
        return MysqlPrisma.user.update({
            where: {
                email: email,
            },
            data: {
                isActive: true,
            },
        });
    }

    async removeUserById(id: number) {
        return MysqlPrisma.user.delete({
            where: {
                id: id,
            },
        });
    }

    async changePassById(id: number, password: string) {
        return MysqlPrisma.user.update({
            where: {
                id: id,
            },
            data: {
                password: password,
                updatedAt: new Date(),
            },
        });
    }

    async addNewlink(id: number, link: string) {
        return MysqlPrisma.link.create({
            data: {
                userId: id,
                description: link,
                createdAt: new Date(),
            },
            include: {
                user: {
                    select: {
                        username: true,
                        email: true,
                    },
                },
            },
        });
    }
}

export default new UserDao();
