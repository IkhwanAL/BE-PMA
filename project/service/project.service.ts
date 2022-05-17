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

    async getOneSmallColumn(idUser: number, idProject: number) {
        return projectDao.getOneSmallColumn(idUser, idProject);
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

    async getOneByIdProject(idProject: number) {
        return projectDao.readOne(idProject);
    }

    async getOneWithIdUserTeam(idUser: number, idProject: number) {
        return projectDao.readProjectByIdUserTeamAndIdProject(
            idUser,
            idProject
        );
    }

    async saveDeadline(idProject: number, deadline: number) {}

    async getAllUserTeamWithIdProject(idProject: number) {
        return projectDao.getAllUserTeamByIdProject(idProject);
    }

    async getLeaderProject(idProject: number) {
        return projectDao.getCurrentLeader(idProject);
    }
}

export default new ProjectService();
