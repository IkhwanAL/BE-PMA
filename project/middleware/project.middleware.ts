import { NextFunction, Request, Response } from 'express';
import { Http } from 'winston/lib/winston/transports';
import { HttpResponse } from '../../common/services/http.service.config';
import { CommonMiddleware } from '../../common/middleware/common.middleware.config';
import projectDao from '../daos/project.dao';

class ProjectMiddleware extends CommonMiddleware {
    async checkProject(req: Request, res: Response, next: NextFunction) {
        try {
            const project = await projectDao.readProjectByIdProjectOrIdUser(
                req.body.id,
                req.body.idProject
            );

            if (!project) {
                return HttpResponse.NotFound(res);
            }

            next();
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async extractidProject(req: Request, res: Response, next: NextFunction) {
        req.body.idProject = parseInt(req.params.idProject);
        next();
    }
}

export default new ProjectMiddleware();
