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
            .patch(
                projectActivityMiddleware.checkFieldProjectActivity,
                projectActivityController.patchProjectActivity
            )
            .get(
                projectActivityMiddleware.checkProject,
                projectActivityController.getAllProjectActivityWithIdProject
            );

        this.app.param(
            'idProjectActivity',
            projectActivityMiddleware.extractIdProjectActivity
        );

        this.app
            .route('/projectactivity/:idProject/:idProjectActivity')
            .all(projectActivityMiddleware.Authentication)
            .delete(
                projectActivityMiddleware.checkIsItLeader,
                projectActivityController.deleteProjectActivity
            );

        this.app.get(
            '/ProjectActivity/GET/:idProjectActivity',
            projectActivityMiddleware.Authentication,
            projectActivityController.getProjectActivityByProjectActivityId
        );

        this.app.patch('/projectactivity/move/:idProjectActivity', [
            projectActivityMiddleware.Authentication,
            projectActivityController.movingCardFromPosistionAToPositionB,
        ]);

        this.app.get(
            '/ProjectActivity/GETSIMPLE/:idProjectActivity',
            projectActivityController.getOneSimple
        );

        return this.app;
    }
}
