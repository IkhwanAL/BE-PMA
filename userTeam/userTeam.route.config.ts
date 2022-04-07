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

        this.app.param('idProject', userTeamMiddleware.extractidProject);

        this.app.param('idTeam', userTeamMiddleware.extractIdTeam);

        this.app.post(
            '/invite',
            userTeamMiddleware.Authentication,
            userTeamMiddleware.checkProject,
            userTeamMiddleware.checkUserTeam,
            userteamController.invite
        );

        this.app.post(
            '/accept',
            userTeamMiddleware.Authentication,
            userTeamMiddleware.checkUserTeam,
            userTeamMiddleware.checkProjectIsExists,
            userteamController.accept
        );

        this.app.delete(
            '/userteam/delete/:idTeam',
            userTeamMiddleware.Authentication,
            usersMiddleware.checkTeam
        );

        this.app.patch(
            '/changeowner/:idProject/:idUserInvitation',
            userTeamMiddleware.Authentication,
            // userTeamMiddleware.validateBody,
            userTeamMiddleware.checkUserTeam,
            userteamController.changeOwner
        );

        return this.app;
    }
}
