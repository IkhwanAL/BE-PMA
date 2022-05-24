import debug from 'debug';
import { CreateUserDto } from '../dto/create.user.dto';
import { PatchUserDto } from '../dto/patch.user.dto';
import MysqlPrisma from '../../common/services/mysql.service.config';
import { Prisma } from '@prisma/client';
import moment from 'moment';

const log: debug.IDebugger = debug('app:in-memory-dao');

class UserDao {
    constructor() {
        log('Users Dao Initilailzed');
    }

    async getUser() {
        return MysqlPrisma.user.findMany();
    }

    /**
     *
     * @param id
     * @param isActive
     * @param column
     * @default @param column will automaticaly add id fot the default column
     */
    async getUsersById(id: number, isActive = true, column = []) {
        let select = {};

        for (const iterator of column) {
            select[iterator] = true;
        }

        return MysqlPrisma.user.findFirst({
            where: {
                id: id,
                isActive: isActive,
            },
            select: {
                id: true,
                ...select,
            },
        });
    }

    async getUserByIdAndMail(
        id: number,
        email: string,
        isActive?: boolean,
        column = []
    ) {
        let select = {};

        for (const iterator of column) {
            select[iterator] = true;
        }
        return MysqlPrisma.user.findFirst({
            where: {
                id: id,
                email: email,
                isActive: isActive,
            },
            select: {
                id: true,
                ...select,
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
                    create: {
                        link: link,
                        description: 'Membuat Link Aktifasi',
                        expiredAt: moment().add(1, 'days').toDate(),
                        createdAt: moment().toDate(),
                    },
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
                link: link,
                description: 'Membuat Link Baru',
                createdAt: new Date(),
                expiredAt: moment().add(1, 'days').toDate(),
            },
            include: {
                user: {
                    select: {
                        username: true,
                        email: true,
                    },
                },
                // user: {
                //     select: {
                //         username: true,
                //         email: true,
                //     },
                // },
            },
        });
    }
}

export default new UserDao();
