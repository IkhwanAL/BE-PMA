import { CommonRoutesConfig } from '../common/common.route.config';
import { Application } from 'express';
import subProjectActivityMiddleware from './middleware/subProjectActivity.middleware';
import subProjectactivityController from './controller/subProjectactivity.controller';

export class SubProjectActivityRoute extends CommonRoutesConfig {
    constructor(app: Application) {
        super(app, 'SubProjectActitivy');
    }

    configureRoutes(): Application {
        this.app.param(
            'idProjectActivity',
            subProjectActivityMiddleware.extractIdProjectActivity
        );

        this.app
            .route('/subProjectActivity/:idProjectActivity')
            .all(
                subProjectActivityMiddleware.Authentication,
                subProjectActivityMiddleware.checkProject
            )
            .post(
                subProjectActivityMiddleware.checkIsItLeader,
                subProjectactivityController.addSubProjectActivity
            );

        return this.app;
    }
}
