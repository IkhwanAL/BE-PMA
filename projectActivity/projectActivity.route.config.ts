import { CommonRoutesConfig } from '../common/common.route.config';
import { Application } from 'express';
import projectActivityMiddleware from './middleware/projectActivity.middleware';
import projectActivityController from './controller/projectActivity.controller';
import projectController from '../project/controller/project.controller';
import projectMiddleware from '../project/middleware/project.middleware';

export class ProjectActivityRoute extends CommonRoutesConfig {
    constructor(app: Application) {
        super(app, 'ProjectActivity');
    }

    configureRoutes(): Application {
        this.app.param('idProject', projectActivityMiddleware.extractidProject);

        this.app
            .route('/projectactivity/project/:idProject')
            .all(projectActivityMiddleware.Authentication)
            .post(
                projectActivityMiddleware.checkIsItLeader,
                projectActivityMiddleware.checkFieldProjectActivity,
                projectActivityController.createProjectActivity
            )
            .get(
                projectActivityMiddleware.checkProject,
                projectActivityController.getProjectActivityBaseOfIdProject
            );

        this.app.param(
            'idProjectActivity',
            projectActivityMiddleware.extractIdProjectActivity
        );

        this.app
            .route('/projectactivity/:idProjectActivity')
            .all(
                projectActivityMiddleware.Authentication,
                projectActivityMiddleware.checkIsItLeader
            )
            // .get(projectActivityController.getOne)
            .patch(projectActivityController.patchProjectActivity)
            .delete(projectActivityController.deleteProjectActivity);

        this.app.patch('/projectactivity/move/:idProjectActivity', [
            projectActivityMiddleware.Authentication,
            projectActivityController.movingCardFromPosistionAToPositionB,
        ]);

        return this.app;
    }
}
