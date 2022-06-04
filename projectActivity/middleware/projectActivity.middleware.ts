import { CommonMiddleware } from '../../common/middleware/common.middleware.config';
import { NextFunction, Request, Response } from 'express';
import { HttpResponse } from '../../common/services/http.service.config';

class ProjectActivityMiddleware extends CommonMiddleware {
    async checkFieldProjectActivity(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        if (!req.body.idProject) {
            return HttpResponse.BadRequest(res);
        }

        if (!req.body.name) {
            return HttpResponse.BadRequest(res);
        }

        if (!req.body.timeToComplete) {
            return HttpResponse.BadRequest(res);
        }

        if (!req.body.description) {
            return HttpResponse.BadRequest(res);
        }

        next();
    }
}

export default new ProjectActivityMiddleware();
