import { Application } from 'express';
import { CommonRoutesConfig } from '../common/common.route.config';
import userteamController from './controller/userteam.controller';
import userTeamMiddleware from './middleware/userTeam.middleware';

export class UserTeamRoutes extends CommonRoutesConfig {
    constructor(app: Application) {
        super(app, 'UserTeam');
    }

    configureRoutes(): Application {
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

        this.app.delete('/userteam/delete', userTeamMiddleware.Authentication);

        this.app.patch(
            '/changeowner',
            userTeamMiddleware.Authentication,
            userTeamMiddleware.checkUserTeam,
            userteamController.changeOwner
        );

        return this.app;
    }
}
