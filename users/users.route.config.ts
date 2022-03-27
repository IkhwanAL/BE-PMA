import express from 'express';
import { CommonRoutesConfig } from '../common/common.route.config';
import usersController from './controllers/users.controller';
import usersMiddleware from './middlewares/users.middleware';

export class UserRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'UserRoutes');
    }

    configureRoutes(): express.Application {
        this.app
            .route('/users')
            //     .get(usersController.listUsers)
            .post(
                usersMiddleware.validateRequiredUserBodyFields,
                // usersMiddleware.validateSameEmailDoesntExist,
                usersController.createUser
            );

        this.app.param('userId', usersMiddleware.extractUserId);

        this.app
            .route('/users/:userId')
            // .all(usersMiddleware.validateUserExists)
            .get(usersController.getUserById);
        // .delete(usersController.removeUser);

        // this.app.put(`/users/:userId`, [
        //     usersMiddleware.validateRequiredUserBodyFields,
        //     usersMiddleware.validateSameEmailBelongToSameUser,
        //     usersController.put,
        // ]);

        // this.app.patch(`/users/:userId`, [
        //     usersMiddleware.validatePatchEmail,
        //     usersController.patch,
        // ]);

        return this.app;
    }
}
