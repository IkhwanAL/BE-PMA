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
}

export default new UserTeamDao();
