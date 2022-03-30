import { Application } from 'express';
import { CommonRoutesConfig } from '../common/common.route.config';

export class UserTeamRoutes extends CommonRoutesConfig {
    constructor(app: Application) {
        super(app, 'UserTeam');
    }

    configureRoutes(): Application {
        this.app.post('invite');

        return this.app;
    }
}
