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
}

export default new UserTeamDao();
