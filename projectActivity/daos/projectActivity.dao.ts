import { Prisma, ProjectActivity } from '@prisma/client';
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
        console.log(
            `SELECT * FROM projectactivity WHERE parent LIKE '%${idProjectActivity}%'`
        );
        return MysqlPrisma.$queryRaw<
            ProjectActivity[]
        >`SELECT * FROM projectactivity pa WHERE pa.parent LIKE ${`%${idProjectActivity}%`}`;
    }
}

export default new ProjectActivityDao();
