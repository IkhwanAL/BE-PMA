import { CommonMiddleware } from '../../common/middleware/common.middleware.config';
import { NextFunction, Request, Response } from 'express';
import usersDao from '../../users/daos/users.dao';
import { HttpResponse } from '../../common/services/http.service.config';

class UserTeamMiddleware extends CommonMiddleware {
    async checkUserTeam(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.body.idUserInvitation) {
                const userTeam = await usersDao.getUsersById(
                    req.body.idUserInvitation,
                    true
                );

                if (!userTeam) {
                    return HttpResponse.NotFound(res);
                }
            }

            if (req.body.idLeaderParam) {
                const userTeam = await usersDao.getUsersById(
                    req.body.idLeaderParam,
                    true
                );

                if (!userTeam) {
                    return HttpResponse.NotFound(res);
                }
            }

            next();
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async validateBody(req: Request, res: Response, next: NextFunction) {
        if (!req.body.idUserInvitation) {
            return HttpResponse.BadRequest(res);
        }

        next();
    }

    async extractIdTeam(req: Request, _res: Response, next: NextFunction) {
        req.body.idTeam = parseInt(req.params.idTeam);

        next();
    }
}

export default new UserTeamMiddleware();
