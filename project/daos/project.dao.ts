import { Prisma } from '@prisma/client';
import moment from 'moment';
import MysqlPrisma from '../../common/services/mysql.service.config';
import { CreateProjectDto } from '../dto/create.project.dto';
import { PatchProjectDto } from '../dto/patch.project.dto';

class ProjectDao {
    async create(id: number, resource: CreateProjectDto) {
        return MysqlPrisma.project.create({
            data: {
                ...resource,
                userOwner: id,
                createdAt: new Date(),
                updatedAt: new Date(),
                userteam: {
                    create: [
                        {
                            role: 'Proyek_Manager',
                            userId: id,
                        },
                    ],
                },
            },
        });
    }

    async readProjectByIdProjectOrIdUser(idUser: number, idProject: number) {
        return MysqlPrisma.project.findFirst({
            where: {
                userOwner: idUser,
                projectId: idProject,
            },
            include: {
                userteam: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                projectactivity: {
                    include: {
                        subdetailprojectactivity: true,
                    },
                },
            },
        });
    }

    async readProjectByIdUserTeamAndIdProject(
        idUserTeam: number,
        idProject: number
    ) {
        return MysqlPrisma.project.findFirst({
            where: {
                userteam: {
                    some: {
                        userId: idUserTeam,
                        projectId: idProject,
                    },
                },
                projectId: idProject,
            },
            include: {
                userteam: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                projectactivity: {
                    include: {
                        subdetailprojectactivity: true,
                    },
                },
            },
        });
    }

    async getOneSmallColumn(idUser: number, idProject: number) {
        return MysqlPrisma.project.findFirst({
            where: {
                OR: [
                    { userOwner: idUser },
                    {
                        userteam: {
                            some: {
                                userId: idUser,
                            },
                        },
                    },
                ],
                projectId: idProject,
            },
            select: {
                projectId: true,
                projectName: true,
                projectDescription: true,
            },
        });
    }

    async readAll(idUser: number, take = null) {
        let condition: Prisma.projectFindManyArgs = {};

        if (take) {
            condition = {
                ...condition,
                take: take,
            };
        }
        return MysqlPrisma.project.findMany({
            ...condition,
            where: {
                OR: [
                    {
                        userOwner: idUser,
                    },
                    {
                        userteam: {
                            some: {
                                userId: idUser,
                            },
                        },
                    },
                ],
            },
            select: {
                projectName: true,
                projectId: true,
                deadline: true,
                projectDescription: true,
                deadlineInString: true,
                user: {
                    select: {
                        username: true,
                    },
                },
                userteam: {
                    select: {
                        user: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async delete(idProject: number) {
        return MysqlPrisma.project.delete({
            where: {
                projectId: idProject,
            },
        });
    }

    async patch(idUser: number, idProject: number, resource: PatchProjectDto) {
        return MysqlPrisma.project.update({
            where: {
                projectId: idProject,
            },
            data: {
                ...resource,
                userOwner: idUser,
                updatedAt: new Date(),
            },
        });
    }

    async readOne(idProject: number) {
        return MysqlPrisma.project.findFirst({
            where: {
                projectId: idProject,
            },
            include: {
                projectactivity: true,
            },
        });
    }

    async patchDeadline(idProject: number, deadline: number) {
        return MysqlPrisma.project.update({
            where: {
                projectId: idProject,
            },
            data: {
                deadline: moment().add(deadline, 'days').toDate(),
                deadlineInString: deadline.toString(),
                updatedAt: new Date(),
            },
        });
    }

    async getRecentProject(idUser: number) {
        return MysqlPrisma.project.findMany({
            take: 4,
            where: {
                OR: {
                    userOwner: idUser,
                    userteam: {
                        every: {
                            userId: idUser,
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: 'asc',
            },
            select: {
                projectName: true,
                projectId: true,
                deadline: true,
                deadlineInString: true,
            },
        });
    }

    async getRecentProjectWithUserTeam(idUserTeam: number) {
        return MysqlPrisma.project.findMany({
            take: 4,
            where: {
                userteam: {
                    every: {
                        userId: idUserTeam,
                    },
                },
            },
        });
    }

    async getAllUserTeamByIdProject(idProject: number) {
        return MysqlPrisma.userteam.findMany({
            where: {
                projectId: idProject,
            },
            select: {
                userId: true,
                teamId: true,
                role: true,
                user: {
                    select: {
                        email: true,
                        username: true,
                    },
                },
            },
        });
    }

    async getCurrentLeader(idProject: number) {
        return MysqlPrisma.project.findFirst({
            where: {
                projectId: idProject,
            },
            select: {
                user: true,
                userOwner: true,
            },
        });
    }
}

export default new ProjectDao();
