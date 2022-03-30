import { PatchUserDto } from '../../users/dto/patch.user.dto';
import projectDao from '../daos/project.dao';
import { CreateProjectDto } from '../dto/create.project.dto';
import { PatchProjectDto } from '../dto/patch.project.dto';

class ProjectService {
    async create(id: number, resource: CreateProjectDto) {
        return projectDao.create(id, resource);
    }

    async getAll(idUser: number) {
        return projectDao.readAll(idUser);
    }

    async deleteProject(idProject: number) {
        return projectDao.delete(idProject);
    }

    async patchProject(
        idUser: number,
        idProject: number,
        resource: PatchProjectDto
    ) {
        return projectDao.patch(idUser, idProject, resource);
    }

    async getOne(idUser: number, idProject: number) {
        return projectDao.readProjectByIdProjectOrIdUser(idUser, idProject);
    }
}

export default new ProjectService();
