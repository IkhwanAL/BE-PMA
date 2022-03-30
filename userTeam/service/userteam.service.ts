import userteamDao from '../daos/userteam.dao';

class UserTeamService {
    async deleteuserTeam(idProject: number, idUser: number) {
        return userteamDao.delete(idProject, idUser);
    }
}

export default new UserTeamService();
