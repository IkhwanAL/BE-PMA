import { ProjectActivity } from '@prisma/client';
import MysqlPrisma from '../../common/services/mysql.service.config';
import { CreateProjectActivityDto } from '../dto/create.projectActivity.dto';
import { PatchProjectActivityDto } from '../dto/patch.projectActivity.dto';

class ProjectActivityDao {
    async getAllActivityWithIdProjectAndIdUser(
        idUser: number,
        idProject: number
    ) {
        return MysqlPrisma.projectActivity.findMany({
            where: {
                projectId: idProject,
                Project: {
                    userOwner: idUser,
                },
            },
        });
    }
    /**
     *
     * @param idUserTeam is same as idUser
     * @param idProject
     * @returns
     */
    async getAllActivityWithIdProjectAndIdUserTeam(
        idUserTeam: number,
        idProject
    ) {
        return MysqlPrisma.$queryRaw<
            ProjectActivity[]
        >`SELECT pa.* FROM projectactivity pa
        INNER JOIN project p On (pa.projectId = p.projectId)
        INNER JOIN userteam ut On (ut.projectId = p.projectId)
        WHERE pa.projectId = ${idProject} AND ut.userId = ${idUserTeam}`;
    }

    async createProjectActivity(resource: CreateProjectActivityDto) {
        return MysqlPrisma.projectActivity.create({
            data: {
                ...resource,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    async patchProjectActivityById(
        idProjectActivity: number,
        resource: PatchProjectActivityDto
    ) {
        return MysqlPrisma.projectActivity.update({
            where: {
                projectActivityId: idProjectActivity,
            },
            data: {
                ...resource,
                updatedAt: new Date(),
            },
        });
    }

    async deleteProjectActivity(idProjectActivity: number) {
        return MysqlPrisma.projectActivity.delete({
            where: {
                projectActivityId: idProjectActivity,
            },
        });
    }
}

export default new ProjectActivityDao();
