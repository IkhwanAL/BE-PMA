import {
    projectactivity,
    subdetailprojectactivity,
    usertaskfromassignee,
} from '@prisma/client';
import MysqlPrisma from '../../common/services/mysql.service.config';
import { ProjectActivityType } from '../../common/@types/project.types';
import {
    CreateProjectActivityDto,
    CreateUserTaskFromAssigneeDto,
} from '../dto/create.projectActivity.dto';
import { PatchProjectActivityDto } from '../dto/patch.projectActivity.dto';
import userteamDao from '../../userTeam/daos/userteam.dao';

interface SubDetailProjectActivityPatch {
    subDetailProjectActivityId?: number;
    detailProyekId: number;
    description: string;
    isComplete?: boolean;
}

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
        const {
            subdetailprojectactivity,
            usertaskfromassignee,
            ...restOfResource
        } = resource;
        return MysqlPrisma.projectactivity.create({
            data: {
                ...restOfResource,
                createdAt: new Date(),
                updatedAt: new Date(),
                subdetailprojectactivity: {
                    createMany: {
                        data:
                            (subdetailprojectactivity as subdetailprojectactivity[]) ??
                            [],
                    },
                },
                usertaskfromassignee: {
                    createMany: {
                        data:
                            (usertaskfromassignee as CreateUserTaskFromAssigneeDto[]) ??
                            [],
                    },
                },
            },
        });
    }

    async patchProjectActivityById(
        idProjectActivity: number,
        resource: PatchProjectActivityDto,
        idUser?: number
    ) {
        const { subdetailprojectactivity, usertaskfromassignee, ...rest } =
            resource;
        return MysqlPrisma.$transaction(async (QueryPrisma) => {
            const leader = userteamDao.getLeader(idUser);

            const UpdateSubDetailProjectActivity = async (
                data: SubDetailProjectActivityPatch[]
            ) => {
                const SavedId: number[] = [];
                console.log(data);
                for (const iterator of data) {
                    const IdProjectSubActivity =
                        iterator.subDetailProjectActivityId
                            ? iterator.subDetailProjectActivityId
                            : 0;
                    const update =
                        await QueryPrisma.subdetailprojectactivity.upsert({
                            where: {
                                subDetailProjectActivityId:
                                    IdProjectSubActivity,
                            },
                            update: {
                                description: iterator.description,
                                isComplete: iterator.isComplete,
                                detailProyekId: iterator.detailProyekId,
                                updatedAt: new Date(),
                            },
                            create: {
                                description: iterator.description,
                                isComplete: iterator.isComplete,
                                detailProyekId: iterator.detailProyekId,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                        });
                    SavedId.push(update.subDetailProjectActivityId);
                }

                // const deleteData =
                //     await QueryPrisma.subdetailprojectactivity.deleteMany({
                //         where: {
                //             subDetailProjectActivityId: {
                //                 notIn: SavedId,
                //             },
                //         },
                //     });
            };

            const UpdateUserTaskFromAssignee = async (data: number[]) => {
                const deleteMany =
                    await QueryPrisma.usertaskfromassignee.deleteMany({
                        where: {
                            projectActivityId: idProjectActivity,
                        },
                    });

                const usertask = [];
                for (const iterator of data) {
                    const payload = {
                        idUser: iterator,
                        projectActivityId: idProjectActivity,
                    };

                    usertask.push(payload);
                }

                const createMany =
                    await QueryPrisma.usertaskfromassignee.createMany({
                        data: usertask,
                    });
            };

            if (!leader) {
                await UpdateSubDetailProjectActivity(subdetailprojectactivity);

                return rest;
            } else {
                console.log(subdetailprojectactivity);
                await UpdateSubDetailProjectActivity(subdetailprojectactivity);
                await UpdateUserTaskFromAssignee(
                    usertaskfromassignee as number[]
                );
                const UpdateQuery = await QueryPrisma.projectactivity.update({
                    where: {
                        projectActivityId: idProjectActivity,
                    },
                    data: {
                        ...rest,
                        updatedAt: new Date(),
                    },
                });

                return UpdateQuery;
            }
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
                projectActivityId: idProjectActivity as number,
            },
            include: {
                subdetailprojectactivity: true,
                usertaskfromassignee: {
                    include: {
                        user: {
                            select: { username: true },
                        },
                    },
                },
            },
        });
    }

    async getOneSimple(idProjectActivity: number) {
        return MysqlPrisma.projectactivity.findFirst({
            where: {
                projectActivityId: idProjectActivity,
            },
            select: {
                name: true,
            },
        });
    }

    async MoveCardPosition(
        idProjectActivity: number,
        resource: PatchProjectActivityDto
    ) {
        const { subdetailprojectactivity, usertaskfromassignee, ...rest } =
            resource;
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

    async getAllActivityBasedOnIdProject(idProject: number) {
        return MysqlPrisma.projectactivity.findMany({
            where: {
                projectId: idProject,
            },
        });
    }

    async patchProgress(idProjectActivity: number, Progress: number) {
        return MysqlPrisma.projectactivity.update({
            where: {
                projectActivityId: idProjectActivity,
            },
            data: {
                progress: Progress,
                updatedAt: new Date(),
            },
        });
    }

    async UpdateParent(idProjectActivity: number, parent: string) {
        return MysqlPrisma.projectactivity.update({
            where: {
                projectActivityId: idProjectActivity,
            },
            data: {
                parent: parent,
                updatedAt: new Date(),
            },
        });
    }
}

export default new ProjectActivityDao();
