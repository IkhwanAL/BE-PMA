import { Application } from 'express';
import { CommonRoutesConfig } from '../common/common.route.config';
import userTaskAssigneeMiddleware from './middleware/userTaskAssignee.middleware';

export class UserTaskFromAssigneeRoute extends CommonRoutesConfig {
    constructor(app: Application) {
        super(app, 'UserTaskFromAssignee');
    }

    configureRoutes(): Application {
        this.app.param(
            'idUserTaskFromAssignee',
            userTaskAssigneeMiddleware.extractIdUserTaskFromAssignee
        );

        this.app.post('/add');
        this.app.delete('/delete/:idUserTaskFromAssignee');
        return this.app;
    }
}
