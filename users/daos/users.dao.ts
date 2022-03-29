import shortid from 'shortid';
import debug from 'debug';
import { CreateUserDto } from '../dto/create.user.dto';
import { PatchUserDto } from '../dto/patch.user.dto';
import { PutUserDto } from '../dto/put.user.dto';
import MysqlPrisma from '../../common/services/mysql.service.config';

const log: debug.IDebugger = debug('app:in-memory-dao');

class UserDao {
    constructor() {
        log('Users Dao Initilailzed');
    }

    async getUser() {
        return MysqlPrisma.user.findMany();
    }

    async getUsersById(id: number) {
        return MysqlPrisma.user.findFirst({
            where: {
                id: id,
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
                Links: {
                    create: [{ description: link }],
                },
            },
            include: {
                Links: true,
            },
        });
    }

    async patchUserById(id: number, resource: PatchUserDto) {
        console.log(resource);
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

    async getUserByEmail(email: string, isActive: boolean) {
        return MysqlPrisma.user.findFirst({
            where: {
                email: email,
                isActive: isActive,
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
}

export default new UserDao();
