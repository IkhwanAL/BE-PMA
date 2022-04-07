import userteamDao from '../daos/userteam.dao';

class UserTeamService {
    async deleteuserTeam(idProject: number, idUser: number) {
        return userteamDao.delete(idProject, idUser);
    }

    async deleteTeam(idTeam: number) {
        return userteamDao.deleteWithIdTeam(idTeam);
    }

    async addUserTeam(idProject: number, idUser: number) {
        return userteamDao.add(idProject, idUser);
    }

    async changeOwner(
        idUser: number,
        idChoosenUser: number,
        idProject: number
    ) {
        return userteamDao.changePM(idUser, idChoosenUser, idProject);
    }
}

export default new UserTeamService();
