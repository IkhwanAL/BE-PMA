import UsersDao from '../daos/users.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateUserDto } from '../dto/create.user.dto';
import { Response } from 'express';
import { PatchUserDto } from '../dto/patch.user.dto';
import { HttpResponse } from '../../common/services/http.service.config';
import usersDao from '../daos/users.dao';

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

    async createLink(id: number, link: string) {
        return usersDao.addNewlink(id, link);
    }
}

export default new UsersService();
