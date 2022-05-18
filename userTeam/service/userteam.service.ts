import userteamDao from '../daos/userteam.dao';

class UserTeamService {
    async deleteuserTeam(idProject: number, idUser: number) {
        return userteamDao.delete(idProject, idUser);
    }

    async deleteTeam(idTeams: Array<number>, idProject?: number) {
        return userteamDao.deleteWithIdTeam(idTeams, idProject);
    }

    async addUserTeam(idProject: number, idUser: number) {
        return userteamDao.add(idProject, idUser);
    }

    async changeOwner(idChoosenUser: number, idProject: number) {
        return userteamDao.changePM(idChoosenUser, idProject);
    }

    async getUserWithIdTeam(idTeam: number) {
        return userteamDao.getUserWithTeamIm(idTeam);
    }
}

export default new UserTeamService();
