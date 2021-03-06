import { CommonRoutesConfig } from '../common/common.route.config';
import express from 'express';
import projectMiddleware from './middleware/project.middleware';
import projectController from './controller/project.controller';

export class ProjectRoute extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'Project');
    }

    configureRoutes(): express.Application {
        this.app
            .route('/project')
            .all(projectMiddleware.Authentication)
            .get(projectController.getAllProject)
            .post(projectController.createProject);

        this.app
            .route('/project/recent')
            .all(projectMiddleware.Authentication)
            .get(projectController.getRecent);

        this.app.param('idProject', projectMiddleware.extractidProject);

        this.app.get(
            '/project/get/:idProject',
            projectMiddleware.Authentication,
            projectMiddleware.checkProject,
            projectController.getOneSmallProject
        );

        this.app
            .route('/project/:idProject')
            .all(
                projectMiddleware.Authentication,
                projectMiddleware.checkProject
            )
            .get(projectController.getOneProject)
            .delete(
                projectMiddleware.checkIsItLeader,
                projectController.deleteProject
            )
            .patch(
                projectMiddleware.checkIsItLeader,
                projectController.patchProject
            );

        this.app.get(
            '/calculate/:idProject',
            projectMiddleware.Authentication,
            projectMiddleware.checkProject,
            projectController.calculate
        );

        // Get User Team

        this.app.get(
            '/project/userteam/:idProject',
            projectMiddleware.Authentication,
            projectMiddleware.checkProject,
            projectController.GetUserTeam
        );

        this.app.get(
            '/project/getCurrentLeader/:idProject',
            projectMiddleware.Authentication,
            projectMiddleware.checkProject,
            projectController.GetLeader
        );
        return this.app;
    }
}
