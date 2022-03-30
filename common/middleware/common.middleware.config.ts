import express from 'express';
import usersDao from '../../users/daos/users.dao';
import { HttpResponse } from '../services/http.service.config';
import { JwtService } from '../services/jwt.service.config';
import { EncryptionTypes } from '../types/Encription.types';
export abstract class CommonMiddleware {
    async Authentication(
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
                req.body.id = user.id;
                req.body.email = user.email;

                next();
            } else {
                return HttpResponse.Unauthorized(res);
            }
        } catch (error) {
            console.log(error);
            return HttpResponse.Unauthorized(res);
        }
    }
}
