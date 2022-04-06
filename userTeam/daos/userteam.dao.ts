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
            MysqlPrisma.userTeam.update({
                where: {
                    userId: idChoosenUser,
                    projectId: idProject,
                },
                data: {
                    role: 'Proyek_Manager',
                },
            }),
            MysqlPrisma.userTeam.update({
                where: {
                    userId: idUser,
                    projectId: idProject,
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
}

export default new UserTeamDao();
