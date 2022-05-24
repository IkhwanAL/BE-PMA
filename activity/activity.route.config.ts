import express from 'express';
import { CommonRoutesConfig } from '../common/common.route.config';
import activityController from './controller/activity.controller';
import activityMiddleware from './middleware/activity.middleware';

export class ActivityRoute extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'Activity');
    }

    configureRoutes(): express.Application {
        this.app.param('idProject', activityMiddleware.extractidProject);

        this.app.get(
            '/activity/:idProject',
            activityMiddleware.Authentication,
            activityController.GetAllActivityUserWithIdProject
        );
        return this.app;
    }
}
