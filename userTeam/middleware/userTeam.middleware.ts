import { CommonMiddleware } from '../../common/middleware/common.middleware.config';
import { NextFunction, Request, Response } from 'express';
import usersDao from '../../users/daos/users.dao';
import { HttpResponse } from '../../common/services/http.service.config';

class UserTeamMiddleware extends CommonMiddleware {
    async checkUserTeam(req: Request, res: Response, next: NextFunction) {
        try {
            const userTeam = await usersDao.getUsersById(
                req.body.idUserInvitation,
                true
            );

            if (!userTeam) {
                return HttpResponse.NotFound(res);
            }

            next();
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }
}

export default new UserTeamMiddleware();
