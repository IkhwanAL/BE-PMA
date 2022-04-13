import { projectactivity, subdetailprojectactivity } from '@prisma/client';
import MysqlPrisma from '../../common/services/mysql.service.config';
import { ProjectActivityType } from '../../common/@types/project.types';
import { CreateProjectActivityDto } from '../dto/create.projectActivity.dto';
import { PatchProjectActivityDto } from '../dto/patch.projectActivity.dto';

class ProjectActivityDao {
    async getAllActivityWithIdProjectAndIdUser(
        idUser: number,
        idProject: number
    ) {
        return MysqlPrisma.projectactivity.findMany({
            where: {
                projectId: idProject,
                project: {
                    userOwner: idUser,
                },
            },
            include: {
                subdetailprojectactivity: true,
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
        const { subdetailprojectactivity, ...restOfResource } = resource;
        return MysqlPrisma.projectactivity.create({
            data: {
                ...restOfResource,
                createdAt: new Date(),
                updatedAt: new Date(),
                subdetailprojectactivity: {
                    createMany: {
                        data: subdetailprojectactivity as subdetailprojectactivity[],
                    },
                },
            },
        });
    }

    async patchProjectActivityById(
        idProjectActivity: number,
        resource: PatchProjectActivityDto
    ) {
        const { subdetailprojectactivity, ...rest } = resource;
        return MysqlPrisma.projectactivity.update({
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
        return MysqlPrisma.projectactivity.delete({
            where: {
                projectActivityId: idProjectActivity,
            },
        });
    }

    async vertexConnectedProjectActivity(idProjectActivity: number) {
        return MysqlPrisma.$queryRaw<
            projectactivity[]
        >`SELECT * FROM projectactivity pa WHERE pa.parent LIKE ${`%${idProjectActivity}%`}`;
    }

    async getOne(idProjectActivity: number) {
        return MysqlPrisma.projectactivity.findFirst({
            where: {
                projectActivityId: idProjectActivity,
            },
            include: {
                subdetailprojectactivity: true,
            },
        });
    }
}

export default new ProjectActivityDao();
