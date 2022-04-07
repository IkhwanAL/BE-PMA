import { Prisma } from '@prisma/client';
import MysqlPrisma from '../../common/services/mysql.service.config';

class UserTeamDao {
    async delete(idProject: number, idUser: number) {
        return MysqlPrisma.userTeam.delete({
            where: {
                projectId: idProject,
                userId: idUser,
            },
        });
    }

    async add(idProject: number, idUser: number) {
        return MysqlPrisma.userTeam.create({
            data: {
                projectId: idProject,
                userId: idUser,
            },
        });
    }

    async getLeader(idUser: number) {
        return MysqlPrisma.userTeam.findFirst({
            where: {
                userId: idUser,
                role: 'Proyek_Manager',
                Project: {
                    userOwner: idUser,
                },
            },
        });
    }

    async getTeamOfProject(idUserTeam: number, idProject: number) {
        return MysqlPrisma.userTeam.findFirst({
            where: {
                userId: idUserTeam,
                projectId: idProject,
            },
        });
    }

    async changePM(idUser: number, idChoosenUser: number, idProject: number) {
        return MysqlPrisma.$transaction([
            MysqlPrisma.userTeam.updateMany({
                where: {
                    AND: { projectId: idProject, userId: idChoosenUser },
                },
                data: {
                    role: 'Proyek_Manager',
                },
            }),
            MysqlPrisma.userTeam.updateMany({
                where: {
                    AND: { projectId: idProject, userId: idUser },
                },
                data: {
                    role: 'Tim',
                },
            }),
            MysqlPrisma.project.update({
                where: {
                    projectId: idProject,
                },
                data: {
                    userOwner: idChoosenUser,
                    updatedAt: new Date(),
                },
            }),
        ]);
    }

    async getTeamPerIdTeam(idTeam: number, idProject?: number) {
        let where: Prisma.UserTeamWhereUniqueInput = {
            teamId: idTeam,
        };
        if (idProject) {
            where = {
                ...where,
                projectId: idProject,
            };
        }

        return MysqlPrisma.userTeam.findFirst({
            where: {
                ...where,
            },
        });
    }

    async deleteWithIdTeam(idTeam: number) {
        return MysqlPrisma.userTeam.delete({
            where: {
                teamId: idTeam,
            },
        });
    }
}

export default new UserTeamDao();
