import UsersDao from '../daos/users.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateUserDto } from '../dto/create.user.dto';
import { PutUserDto } from '../dto/put.user.dto';
import { PatchUserDto } from '../dto/patch.user.dto';

class UsersService implements CRUD {
    async create(resource: CreateUserDto) {
        return UsersDao.addUser(resource);
    }

    async deleteById(id: number) {
        return UsersDao.removeUserById(id);
    }

    async patchById(id: number, resource: PatchUserDto) {
        return UsersDao.patchUserById(id, resource);
    }

    async readById(id: number) {
        return UsersDao.getUsersById(id);
    }

    async readByEmail(email: string, isActive: boolean = false) {
        return UsersDao.getUserByEmail(email, isActive);
    }

    async activating(email: string) {
        return UsersDao.patchActiveUser(email);
    }

    async changePassword(id: number, password: string) {
        return UsersDao.changePassById(id, password);
    }
}

export default new UsersService();
