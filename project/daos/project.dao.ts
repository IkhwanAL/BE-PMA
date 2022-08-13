import {
    Prisma,
    project,
    projectactivity,
    subdetailprojectactivity,
    userteam,
} from '@prisma/client';
import moment from 'moment';
import MysqlPrisma from '../../common/services/mysql.service.config';
import { CreateProjectDto } from '../dto/create.project.dto';
import { PatchProjectDto } from '../dto/patch.project.dto';

enum OrderBy {
    desc = 'desc',
    asc = 'asc',
}

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

    async GetOneRaw(
        idUser: number,
        idProject: number
    ): Promise<
        project & {
            projectactivity: (projectactivity & {
                subdetailprojectactivity: subdetailprojectactivity[];
            })[];
            userteam: (userteam & {
                user: {
                    id: number;
                    firstName: string;
                    lastName: string;
                    email: string;
                    username: string;
                };
            })[];
        }
    > {
        let ObjResult: project & {
            projectactivity: (projectactivity & {
                subdetailprojectactivity: subdetailprojectactivity[];
            })[];
            userteam: (userteam & {
                user: {
                    id: number;
                    firstName: string;
                    lastName: string;
                    email: string;
                    username: string;
                };
            })[];
        };

        const Project = await MysqlPrisma.project.findFirst({
            where: {
                projectId: idProject,
                userOwner: idUser,
            },
        });

        const ProjectActivity = await MysqlPrisma.$queryRaw<
            (projectactivity & {
                subdetailprojectactivity: subdetailprojectactivity[];
            })[]
        >`SELECT * FROM projectactivity WHERE projectId = ${idProject} ORDER BY updatedAt DESC`;

        for (const iterator in ProjectActivity) {
            const Sub = await MysqlPrisma.subdetailprojectactivity.findMany({
                where: {
                    detailProyekId: ProjectActivity[iterator].projectActivityId,
                },
            });
            ProjectActivity[iterator].subdetailprojectactivity = Sub;
        }

        const UserTeam = await MysqlPrisma.userteam.findMany({
            where: {
                projectId: idProject,
            },
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
        });

        ObjResult = {
            ...Project,
            projectactivity: ProjectActivity,
            userteam: UserTeam,
        };

        return ObjResult;
    }

    async GetOneRawTeam(
        idProject: number,
        idUserTeam: number
    ): Promise<
        project & {
            projectactivity: (projectactivity & {
                subdetailprojectactivity: subdetailprojectactivity[];
            })[];
            userteam: (userteam & {
                user: {
                    id: number;
                    firstName: string;
                    lastName: string;
                    email: string;
                    username: string;
                };
            })[];
        }
    > {
        const Project = await MysqlPrisma.project.findFirst({
            where: {
                userteam: {
                    some: {
                        userId: idUserTeam,
                        projectId: idProject,
                    },
                },
            },
        });

        const UserTeam = await MysqlPrisma.userteam.findMany({
            where: {
                projectId: idProject,
            },
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
        });

        const ProjectActivity = await MysqlPrisma.$queryRaw<
            (projectactivity & {
                subdetailprojectactivity: subdetailprojectactivity[];
            })[]
        >`SELECT * FROM projectactivity WHERE projectId = ${idProject} ORDER BY CHAR_LENGTH(parent)`;

        for (const iterator in ProjectActivity) {
            const Sub = await MysqlPrisma.subdetailprojectactivity.findMany({
                where: {
                    detailProyekId: ProjectActivity[iterator].projectActivityId,
                },
            });
            ProjectActivity[iterator].subdetailprojectactivity = Sub;
        }

        return {
            ...Project,
            projectactivity: ProjectActivity,
            userteam: UserTeam,
        };
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
                    orderBy: {
                        parent: 'asc',
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
                    orderBy: {
                        parent: 'asc',
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
                startDate: true,
            },
        });
    }

    async readAll(idUser: number, take?: number, Recent?: boolean) {
        return MysqlPrisma.project.findMany({
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
            orderBy: {
                updatedAt: 'desc',
            },
            include: {
                // projectName: true,
                // projectId: true,
                // deadline: true,
                // projectDescription: true,
                // deadlineInString: true,
                user: {
                    select: {
                        username: true,
                    },
                },
                projectactivity: {
                    select: {
                        progress: true,
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

    async getRecent(idUser: number) {
        return MysqlPrisma.project.findMany({
            take: 4,
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
            orderBy: {
                activity: {
                    _count: 'desc',
                },
            },
            select: {
                projectName: true,
                projectId: true,
                deadline: true,
                projectDescription: true,
                deadlineInString: true,
                activity: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
                projectactivity: {
                    select: {
                        progress: true,
                    },
                },
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

    async patchDeadline(
        idProject: number,
        deadline: number,
        startDate?: Date,
        endDate?: Date
    ) {
        if (startDate && endDate) {
            throw Error('Gagal');
        }

        if (startDate) {
            return MysqlPrisma.project.update({
                where: {
                    projectId: idProject,
                },
                data: {
                    deadline: moment(startDate).add(deadline, 'days').toDate(),
                    deadlineInString: deadline.toString(),
                    updatedAt: new Date(),
                },
            });
        }

        if (endDate) {
            return MysqlPrisma.project.update({
                where: {
                    projectId: idProject,
                },
                data: {
                    deadline: endDate,
                    deadlineInString: deadline.toString(),
                    updatedAt: new Date(),
                },
            });
        }
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

    async getOneWithProjectId(idProject: number) {
        return MysqlPrisma.project.findFirst({
            where: {
                projectId: idProject,
            },
            include: {
                projectactivity: true,
                userteam: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }
}

export default new ProjectDao();
