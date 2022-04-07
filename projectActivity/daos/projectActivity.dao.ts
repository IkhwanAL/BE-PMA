import { ProjectActivity } from '@prisma/client';
import MysqlPrisma from '../../common/services/mysql.service.config';
import { ProjectActivityType } from '../../common/types/project.types';
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
            include: {
                SubDetailProjectActivity: true,
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
            ProjectActivityType[]
        >`SELECT pa.*, sd.* FROM projectactivity pa
        INNER JOIN project p On (pa.projectId = p.projectId)
        INNER JOIN userteam ut On (ut.projectId = p.projectId)
        INNER JOIN subdetailprojectactivity sd On (sd.detailProyekId = pa.projectActivityId)
        WHERE pa.projectId = ${idProject} AND ut.userId = ${idUserTeam}`;
    }

    async createProjectActivity(resource: CreateProjectActivityDto) {
        const { SubDetailProjectActivity, ...restOfResource } = resource;
        return MysqlPrisma.projectActivity.create({
            data: {
                ...restOfResource,
                createdAt: new Date(),
                updatedAt: new Date(),
                SubDetailProjectActivity: {
                    createMany: {
                        data: SubDetailProjectActivity,
                    },
                },
            },
        });
    }

    async patchProjectActivityById(
        idProjectActivity: number,
        resource: PatchProjectActivityDto
    ) {
        const { SubDetailProjectActivity, ...rest } = resource;
        return MysqlPrisma.projectActivity.update({
            where: {
                projectActivityId: idProjectActivity,
            },
            data: {
                ...rest,
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

    async vertexConnectedProjectActivity(idProjectActivity: number) {
        return MysqlPrisma.$queryRaw<
            ProjectActivity[]
        >`SELECT * FROM projectactivity pa WHERE pa.parent LIKE ${`%${idProjectActivity}%`}`;
    }

    async getOne(idProjectActivity: number) {
        return MysqlPrisma.projectActivity.findFirst({
            where: {
                projectActivityId: idProjectActivity,
            },
            include: {
                SubDetailProjectActivity: true,
            },
        });
    }
}

export default new ProjectActivityDao();
