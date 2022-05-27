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
        resource: PatchProjectActivityDto,
        idUser?: number
    ) {
        return projectActivityDao.patchProjectActivityById(
            idProjectActivity,
            resource,
            idUser
        );
    }

    async PatchProgress(idProjectActivity: number, Progress: number) {
        return projectActivityDao.patchProgress(idProjectActivity, Progress);
    }

    async deleteProjectActivity(idProjectActivity: number) {
        return projectActivityDao.deleteProjectActivity(idProjectActivity);
    }

    async getProjectACtivityVertex(idProjectActivity: number) {
        return projectActivityDao.vertexConnectedProjectActivity(
            idProjectActivity
        );
    }

    async getOneProjectActivity(idProjectActivity: number) {
        return projectActivityDao.getOne(idProjectActivity);
    }

    async getSimple(idProjectActivity: number) {
        return projectActivityDao.getOneSimple(idProjectActivity);
    }

    async MovingCardPosisition(
        idProjectActivity: number,
        resource: PatchProjectActivityDto
    ) {
        return projectActivityDao.MoveCardPosition(idProjectActivity, resource);
    }

    async getAllProjectActivityBasedOnidProject(idProject: number) {
        return projectActivityDao.getAllActivityBasedOnIdProject(idProject);
    }
}

export default new ProjectActivityService();
