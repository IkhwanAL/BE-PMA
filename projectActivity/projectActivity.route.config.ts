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
            .route('/projectactivity/:idProject')
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
            .route('/projectactivity/get/:idProjectActivity')
            .all(projectActivityMiddleware.Authentication)
            .get(projectActivityController.getOne)
            .patch(projectActivityController.patchProjectActivity)
            .delete(
                projectActivityMiddleware.checkIsItLeader,
                projectActivityController.deleteProjectActivity
            );

        return this.app;
    }
}
