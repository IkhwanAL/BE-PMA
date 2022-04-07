import express from 'express';
import { CommonRoutesConfig } from '../common/common.route.config';

export class ActivityRoute extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'Activity');
    }

    configureRoutes(): express.Application {
        return this.app;
    }
}
