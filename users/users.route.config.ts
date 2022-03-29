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
            .route('/login')
            .post(
                usersMiddleware.validRequriedUserLoginFieldss,
                usersController.login
            );

        this.app.route('/verify').get(usersController.verify);
        // this.app.route('/refreshLink');

        // Register
        this.app
            .route('/users')
            .post(
                usersMiddleware.validateRequiredUserBodyFields,
                usersMiddleware.validateSameEmailDoesntExist,
                usersController.createUser
            );

        this.app.param('userId', usersMiddleware.extractUserId);

        //
        this.app
            .route('/users/')
            .all(
                usersMiddleware.Authentication,
                usersMiddleware.validateUserExists
            )
            .get(usersController.getUserById)
            .delete(usersController.removeUser);

        this.app.patch('/users/changeps', [
            usersMiddleware.Authentication,
            usersMiddleware.validateUserExists,
            usersController.changePassword,
        ]);

        // this.app.put(`/users/:userId`, [
        //     usersMiddleware.validateRequiredUserBodyFields,
        //     usersMiddleware.validateSameEmailBelongToSameUser,
        //     usersController.put,
        // ]);

        this.app.patch(`/users`, [
            // usersMiddleware.validatePatchEmail,
            usersMiddleware.Authentication,
            usersMiddleware.validateUserExists,
            usersController.patchUser,
        ]);

        return this.app;
    }
}
