import { CommonMiddleware } from '../../common/middleware/common.middleware.config';
import { NextFunction, Request, Response } from 'express';
import usersDao from '../../users/daos/users.dao';
import { HttpResponse } from '../../common/services/http.service.config';
import { EncryptService } from '../../common/services/encrypt.service.config';

class UserTeamMiddleware extends CommonMiddleware {
    async checkUserTeam(req: Request, res: Response, next: NextFunction) {
        const crypt = new EncryptService();
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

            // if (req.body.idLeaderParam) {
            //     const idLeader = decodeURIComponent(req.body.idLeaderParam);

            //     const userTeam = await usersDao.getUsersById(
            //         parseInt(idLeader),
            //         true
            //     );

            //     if (!userTeam) {
            //         return HttpResponse.NotFound(res);
            //     }
            // }

            if (req.body.Link) {
                const Url = decodeURIComponent(req.body.Link);
                const decrypt = crypt.decrypt(Url) as string;
                const split = decrypt.split('+');
                // console.log(decodeURIComponent(split[0]));
                req.body.idLeaderParam = parseInt(split[1]);
                req.body.idProject = crypt.decrypt(
                    decodeURIComponent(split[0])
                );
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

    async extractLink(req: Request, _res: Response, next: NextFunction) {
        req.body.Link = req.params.Link;

        next();
    }
}

export default new UserTeamMiddleware();
