import UsersDao from '../daos/users.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateUserDto } from '../dto/create.user.dto';
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

    async readById(id: number, isActive = true, column = []) {
        return UsersDao.getUsersById(id, isActive, column);
    }

    async readByEmail(email: string, isActive?: boolean) {
        return UsersDao.getUserByEmail(email, isActive);
    }

    async activating(email: string) {
        return UsersDao.patchActiveUser(email);
    }

    async changePassword(id: number, password: string) {
        return UsersDao.changePassById(id, password);
    }

    async createLink(id: number, link: string) {
        return UsersDao.addNewlink(id, link);
    }

    async getUserWithIdAndEmail(
        id: number,
        email: string,
        isActive?: boolean,
        column = []
    ) {
        return UsersDao.getUserByIdAndMail(id, email, isActive, column);
    }
}

export default new UsersService();
