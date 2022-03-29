import express from 'express';
import userService from '../services/user.service';
import debug from 'debug';
import { FailedTypes } from '../../common/types/failed.types';
import { Http } from 'winston/lib/winston/transports';
import { HttpResponse } from '../../common/services/http.service.config';
import { JwtService } from '../../common/services/jwt.service.config';
import { EncryptionTypes } from '../../common/types/Encription.types';
import usersDao from '../daos/users.dao';

const log: debug.IDebugger = debug('app:users-controller');

class UsersMiddleware {
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

    async Authentiocation(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const bearerToken = req.headers.authorization;
        const jwt = new JwtService();

        if (!bearerToken) {
            return HttpResponse.Unauthorized(res);
        }

        const token = bearerToken.split(' ')[1];

        try {
            const decode = jwt.decryptToken(token);

            const { id } = decode as EncryptionTypes;

            const user = await usersDao.getUsersById(id);

            if (user) {
                req['auth']['id'] = id;
                req['auth']['email'] = user.email;

                next();
            } else {
                return HttpResponse.Unauthorized(res);
            }
        } catch (error) {
            return HttpResponse.Unauthorized(res);
        }
    }

    async validateSameEmailBelongToSameUser(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const user = await userService.readByEmail(req.body.email, true);
        console.log(user, 'asd');
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

    // async validateUserExists(
    //     req: express.Request,
    //     res: express.Response,
    //     next: express.NextFunction
    // ) {
    //     const user = await userService.readById(req.params.userId);
    //     if (user) {
    //         next();
    //     } else {
    //         res.status(404).send({
    //             error: `User ${req.params.userId} not found`,
    //         });
    //     }
    // }

    async extractUserId(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        req.body.id = req.params.userId;
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
}

export default new UsersMiddleware();
