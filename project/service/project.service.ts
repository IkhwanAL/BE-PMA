import { PatchUserDto } from '../../users/dto/patch.user.dto';
import projectDao from '../daos/project.dao';
import { CreateProjectDto } from '../dto/create.project.dto';

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
        resource: PatchUserDto
    ) {
        return;
    }
}

export default new ProjectService();
