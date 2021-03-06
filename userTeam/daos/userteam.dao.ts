import MysqlPrisma from '../../common/services/mysql.service.config';
import { Prisma } from '@prisma/client';
class UserTeamDao {
    async delete(idProject: number, idUser: number) {
        return MysqlPrisma.userteam.deleteMany({
            where: {
                projectId: idProject,
                userId: idUser,
            },
        });
    }

    async add(idProject: number, idUser: number) {
        return MysqlPrisma.userteam.create({
            data: {
                projectId: idProject,
                userId: idUser,
            },
        });
    }

    async getLeader(idUser: number) {
        return MysqlPrisma.userteam.findFirst({
            where: {
                userId: idUser,
                role: 'Proyek_Manager',
                project: {
                    userOwner: idUser,
                },
            },
        });
    }

    async isItLeader(idProject: number) {
        return MysqlPrisma.userteam.findFirst({
            where: {
                role: 'Proyek_Manager',
                projectId: idProject,
            },
        });
    }

    async getTeamFromProyek(idUser: number, idProject: number) {
        return MysqlPrisma.userteam.findFirst({
            where: {
                userId: idUser,
                projectId: idProject,
            },
        });
    }

    async getTeamOfProject(idUserTeam: number, idProject: number) {
        return MysqlPrisma.userteam.findFirst({
            where: {
                userId: idUserTeam,
                projectId: idProject,
            },
        });
    }

    /**
     *
     * @param idChoosenUser User That Been Choosen To Promote To Proyek Manager
     * @param idProject What Project THat WIll CHange The Leader
     * @returns
     */
    async changePM(idChoosenUser: number, idProject: number) {
        return MysqlPrisma.$transaction(async (PrismaType) => {
            // 1. Ubah Semua Status Pada IdProject di table userteam menjadi tim
            const ChangeIdProjectTeamUserRoleToTim =
                await PrismaType.userteam.updateMany({
                    where: {
                        projectId: idProject,
                    },
                    data: {
                        role: 'Tim',
                    },
                });

            // 2. Optional Jika Gk Ada Tim
            if (ChangeIdProjectTeamUserRoleToTim.count === 0) {
                throw new Error('User Tim Kosong');
            }

            const ChangeOwner = await PrismaType.project.update({
                where: {
                    projectId: idProject,
                },
                data: {
                    userOwner: idChoosenUser,
                },
            });

            if (!ChangeOwner) {
                throw new Error('Terjadi Kesalahan Pada Server');
            }

            const ChangeChoosenUserBecomeAProyekManager =
                await PrismaType.userteam.updateMany({
                    where: {
                        AND: [
                            {
                                projectId: idProject,
                            },
                            {
                                userId: idChoosenUser,
                            },
                        ],
                    },
                    data: {
                        role: 'Proyek_Manager',
                    },
                });

            return ChangeChoosenUserBecomeAProyekManager;
        });
    }

    async getTeamPerIdTeam(idTeam: number, idProject?: number) {
        let where: Prisma.userteamWhereInput = {
            teamId: idTeam,
        };
        if (idProject) {
            where = {
                ...where,
                projectId: idProject,
            };
        }

        return MysqlPrisma.userteam.findFirst({
            where: {
                ...where,
            },
        });
    }

    async deleteWithIdTeam(idTeams: Array<number>, idProject?: number) {
        if (idProject) {
            return MysqlPrisma.userteam.deleteMany({
                where: {
                    userId: {
                        in: idTeams,
                    },
                    projectId: idProject,
                },
            });
        } else {
            return MysqlPrisma.userteam.deleteMany({
                where: {
                    teamId: {
                        in: idTeams,
                    },
                },
            });
        }
    }

    async getUserWithTeamIm(idTeam: number) {
        return MysqlPrisma.userteam.findFirst({
            where: {
                teamId: idTeam,
            },
            select: {
                userId: true,
                role: true,
            },
        });
    }

    async getTeamWithIdProject(idProject: number) {
        return MysqlPrisma.userteam.findMany({
            where: {
                projectId: idProject,
            },
            include: {
                project: false,
                user: {
                    select: {
                        username: true,
                        email: true,
                    },
                },
            },
        });
    }
}

export default new UserTeamDao();
