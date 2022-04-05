import { CommonRoutesConfig } from '../common/common.route.config';
import { Application } from 'express';

export class SubProjectActivity extends CommonRoutesConfig {
    constructor(app: Application) {
        super(app, 'SubProjectActitivy');
    }

    configureRoutes(): Application {
        return this.app;
    }
}
