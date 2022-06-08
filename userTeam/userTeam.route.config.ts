import { Application } from 'express';
import { CommonRoutesConfig } from '../common/common.route.config';
import usersMiddleware from '../users/middlewares/users.middleware';
import userteamController from './controller/userteam.controller';
import userTeamMiddleware from './middleware/userTeam.middleware';

export class UserTeamRoutes extends CommonRoutesConfig {
    constructor(app: Application) {
        super(app, 'UserTeam');
    }

    configureRoutes(): Application {
        this.app.param(
            'idUserInvitation',
            userTeamMiddleware.extractidUserInvitation
        );

        this.app.param(
            'idLeaderParam',
            userTeamMiddleware.extractIdLeaderParam
        );

        this.app.param('idProject', userTeamMiddleware.extractidProject);

        this.app.param('idTeam', userTeamMiddleware.extractIdTeam);

        // Invite User
        this.app.post(
            '/invite/:idProject',
            userTeamMiddleware.Authentication,
            userTeamMiddleware.checkProject,
            userTeamMiddleware.checkUserTeam,
            userTeamMiddleware.checkIsItLeader,
            userteamController.invite
        );

        // User
        this.app.get(
            '/accept',
            // userTeamMiddleware.Authentication,
            // userTeamMiddleware.checkUserTeam,
            // userTeamMiddleware.checkProjectIsExists,
            userteamController.accept
        );

        this.app.delete(
            '/userteam/delete/:idProject',
            userTeamMiddleware.Authentication,
            userTeamMiddleware.checkIsItLeader,
            userTeamMiddleware.checkProjectIsExists,
            userteamController.deleteTeam
        );

        // Invitation To Change Owner
        this.app.post(
            '/changeowner/:idProject/:idUserInvitation',
            userTeamMiddleware.Authentication,
            userTeamMiddleware.checkIsItLeader,
            userTeamMiddleware.checkUserTeam,
            userteamController.changeOwner
        );

        // this.app.get(
        //     '/ownerchange/:idProject/:idLeaderParam',
        //     // userTeamMiddleware.Authentication,
        //     userTeamMiddleware.checkUserTeam,
        //     userteamController.ownerChange
        // );

        this.app.param('Link', userTeamMiddleware.extractLink);

        // Accept Change Owner
        this.app.get(
            '/ownerchange/:Link',
            // userTeamMiddleware.Authentication,
            userTeamMiddleware.checkUserTeam,
            userteamController.ownerChange
        );

        return this.app;
    }
}
