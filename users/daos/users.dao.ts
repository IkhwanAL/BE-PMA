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
        return MysqlPrisma.user.create({
            data: {
                ...resource,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    async patchUserById(resource: PatchUserDto) {
        return MysqlPrisma.user.update({
            data: {
                ...resource,
                updatedAt: new Date(),
            },
        });
    }
}

export default new UserDao();
