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

        this.app.param('idProject', projectMiddleware.extractidProject);

        this.app
            .route('/project/:idProject')
            .all(
                projectMiddleware.Authentication,
                projectMiddleware.checkProject
            )
            .get(projectController.getOneProject)
            .delete(projectController.deleteProject)
            .patch(projectController.patchProject);

        return this.app;
    }
}
