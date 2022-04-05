import projectActivityDao from '../daos/projectActivity.dao';
import { CreateProjectActivityDto } from '../dto/create.projectActivity.dto';
import { PatchProjectActivityDto } from '../dto/patch.projectActivity.dto';

class ProjectActivityService {
    async getAllProjectActivity(idUser: number, idProject: number) {
        return projectActivityDao.getAllActivityWithIdProjectAndIdUser(
            idUser,
            idProject
        );
    }

    async getAllProjectActivityForTeam(idUser: number, idProject: number) {
        return projectActivityDao.getAllActivityWithIdProjectAndIdUserTeam(
            idUser,
            idProject
        );
    }

    async createNewProject(resource: CreateProjectActivityDto) {
        return projectActivityDao.createProjectActivity(resource);
    }

    async patchProjectActivity(
        idProjectActivity: number,
        resource: PatchProjectActivityDto
    ) {
        return projectActivityDao.patchProjectActivityById(
            idProjectActivity,
            resource
        );
    }

    async deleteProjectActivity(idProjectActivity: number) {
        return projectActivityDao.deleteProjectActivity(idProjectActivity);
    }

    async getProjectACtivityVertex(idProjectActivity: number) {
        return projectActivityDao.vertexConnectedProjectActivity(
            idProjectActivity
        );
    }
}

export default new ProjectActivityService();