import express from 'express';
import projectDao from '../../project/daos/project.dao';
import usersDao from '../../users/daos/users.dao';
import userteamDao from '../../userTeam/daos/userteam.dao';
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

    async checkProject(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        try {
            const project = await projectDao.readProjectByIdProjectOrIdUser(
                req.body.id,
                req.body.idProject
            );

            if (!project) {
                const projectTeam =
                    projectDao.readProjectByIdUserTeamAndIdProject(
                        req.body.id,
                        req.body.idProject
                    );
                if (!projectTeam) {
                    return HttpResponse.NotFound(res);
                }
            }

            next();
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async checkProjectIsExists(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        try {
            const project = await projectDao.readOne(req.body.idProject);

            if (!project) {
                return HttpResponse.NotFound(res);
            }

            next();
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async checkIsItLeader(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        try {
            const leader = await userteamDao.getLeader(req.body.id);

            if (!leader) {
                return HttpResponse.Unauthorized(res);
            }

            next();
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }
}
