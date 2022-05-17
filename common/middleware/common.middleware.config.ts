import express from 'express';
import projectDao from '../../project/daos/project.dao';
import usersDao from '../../users/daos/users.dao';
import userteamDao from '../../userTeam/daos/userteam.dao';
import { HttpResponse } from '../services/http.service.config';
import { JwtService } from '../services/jwt.service.config';
import { EncryptionTypes } from '../@types/Encription.types';
import { SuccessReturnAuth } from '../@types/success.types';
import { EncryptService } from '../services/encrypt.service.config';
export abstract class CommonMiddleware {
    // protected jwt = new JwtService();
    // constructor() {
    //     this.Authentication.bind(this);
    // }
    async Authentication(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const bearerToken = req.headers.authorization;

        if (!bearerToken) {
            return HttpResponse.Unauthorized(res);
        }

        const token = bearerToken.split(' ')[1];

        try {
            const jwt = new JwtService();
            const decode = jwt.decryptToken(token);

            const { id } = decode as EncryptionTypes;

            const user = (await usersDao.getUsersById(id, true, [
                'email',
            ])) as SuccessReturnAuth;

            if (user) {
                req.body.id = user.id;
                req.body.email = user.email;

                next();
            } else {
                return HttpResponse.NotFound(res);
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return HttpResponse.Unauthorized(res, 'TokenExpire', {
                    name: 'TokenExpire',
                });
            }

            return HttpResponse.Unauthorized(res);
        }
    }

    async AuthRefreshToken(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        try {
            const token = req.cookies.cookie;

            const crypt = new EncryptService();
            const jwt = new JwtService();

            const refreshToken = crypt.decrypt(token);
            const decode = jwt.decryptToken(refreshToken);

            const { id, email } = decode as EncryptionTypes;

            const user = (await usersDao.getUserByIdAndMail(id, email, true, [
                'email',
            ])) as SuccessReturnAuth;

            if (user) {
                req.body.id = user.id;
                req.body.email = user.email;

                next();
            } else {
                return HttpResponse.NotFound(res);
            }
        } catch (error) {
            return HttpResponse.Unauthorized(res, 'Tidak Punya Akses');
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

    async extractIdProjectActivity(
        req: express.Request,
        _res: express.Response,
        next: express.NextFunction
    ) {
        req.body.idProjectActivity = parseInt(req.params.idProjectActivity);
        next();
    }
    async extractidProject(
        req: express.Request,
        _res: express.Response,
        next: express.NextFunction
    ) {
        req.body.idProject = parseInt(req.params.idProject);
        next();
    }

    async extractIdSubProjectActivity(
        req: express.Request,
        _res: express.Response,
        next: express.NextFunction
    ) {
        req.body.idSubProjectActivity = parseInt(
            req.params.idSubProjectActivity
        );
        next();
    }

    async extractidUserInvitation(
        req: express.Request,
        _res: express.Response,
        next: express.NextFunction
    ) {
        req.body.idUserInvitation = parseInt(req.params.idUserInvitation);

        next();
    }

    async extractIdLeaderParam(
        req: express.Request,
        _res: express.Response,
        next: express.NextFunction
    ) {
        req.body.idLeaderParam = parseInt(req.params.idLeaderParam);

        next();
    }

    async isIsOnTheTeam(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        try {
            const team = userteamDao.getTeamOfProject(
                req.body.id,
                req.body.idProject
            );

            if (team) {
                next();
            }

            return HttpResponse.Forbidden(res);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }
}
