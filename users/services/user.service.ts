import UsersDao from '../daos/users.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateUserDto } from '../dto/create.user.dto';
import { PutUserDto } from '../dto/put.user.dto';
import { PatchUserDto } from '../dto/patch.user.dto';

class UsersService implements CRUD {
    async create(resource: CreateUserDto) {
        return UsersDao.addUser(resource);
    }

    // async deleteById(id: string) {
    //     return UsersDao.removeUserById(id);
    // }

    // async list(limit: number, page: number) {
    //     return UsersDao.getUser();
    // }

    async patchById(id: number, resource: PatchUserDto) {
        return UsersDao.patchUserById(id, resource);
    }

    async readById(id: number) {
        return UsersDao.getUsersById(id);
    }

    async readByEmail(email: string, isActive: boolean = false) {
        return UsersDao.getUserByEmail(email, isActive);
    }

    // async putById(id: string, resource: PutUserDto) {
    //     return UsersDao.putUserById(id, resource);
    // }

    // async getUserByEmail(email: string) {
    //     return UsersDao.getUserByEmail(email);
    // }

    async activating(email: string) {
        return UsersDao.patchActiveUser(email);
    }
}

export default new UsersService();
