import express from 'express';
import userService from '../services/user.service';
import debug from 'debug';
import { FailedTypes } from '../../common/@types/failed.types';
import { HttpResponse } from '../../common/services/http.service.config';
import { CommonMiddleware } from '../../common/middleware/common.middleware.config';
import argon2 from 'argon2';
import { user } from '@prisma/client';

const log: debug.IDebugger = debug('app:users-controller');

class UsersMiddleware extends CommonMiddleware {
    constructor() {
        super();
        // this.AuthRefreshToken.bind(this.jwt);
    }
    async validateRequiredUserBodyFields(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (
            req.body &&
            req.body.email &&
            req.body.password &&
            req.body.username
        ) {
            next();
        } else {
            res.status(400).send({
                error: `Missing required fields email and password and username`,
            });
        }
    }

    async validateSameEmailDoesntExist(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const user = await userService.readByEmail(req.body.email);
        if (user) {
            res.status(400).send({ error: `User email already exists` });
        } else {
            next();
        }
    }

    async validateSameEmailBelongToSameUser(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const user = await userService.readByEmail(req.body.email, true);

        if (user && user.id === parseInt(req.params.userId)) {
            next();
        } else {
            res.status(400).send({
                error: `InvalidEmail`,
                message: 'Email Tidak Valid',
                sukses: false,
                status: 400,
            } as FailedTypes);
        }
    }

    // Here we need to use an arrow function to bind `this` correctly
    validatePatchEmail = async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        if (req.body.email) {
            log('Validating email', req.body.email);

            this.validateSameEmailBelongToSameUser(req, res, next);
        } else {
            next();
        }
    };

    async validateUserExists(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const user = await userService.readById(req.body.id);
        if (user) {
            next();
        } else {
            return HttpResponse.NotFound(res);
        }
    }

    async extractUserId(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        req.body.id = parseInt(req.params.userId);
        next();
    }

    async validRequriedUserLoginFieldss(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (req.body && req.body.email && req.body.password) {
            next();
        } else {
            res.status(400).send({
                error: `BadRequest`,
                sukses: false,
                status: 400,
                message: '',
            } as FailedTypes);
        }
    }

    async validateEmailIsExists(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        try {
            const user = await userService.readByEmail(req.body.email);

            if (!user) {
                return HttpResponse.NotFound(res);
            }

            req.body.id = user.id;

            next();
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    public validatePassword = async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const user = (await userService.readById(req.body.id, true, [
                'password',
            ])) as user;

            const validatePass = await argon2.verify(
                user.password,
                req.body.currentPassword
            );
            console.log(validatePass);

            if (validatePass) {
                next();
            } else {
                return HttpResponse.Forbidden(res, 'Password Tidak Ada');
            }
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };
}

export default new UsersMiddleware();
