import { NextFunction, Request, Response } from 'express';
import { CommonMiddleware } from '../../common/middleware/common.middleware.config';

class UserTaskFromAssigneeMiddleware extends CommonMiddleware {
    async extractIdUserTaskFromAssignee(
        req: Request,
        _res: Response,
        next: NextFunction
    ) {
        req.body.idUserTaskFromAssignee = parseInt(
            req.params.idUserTaskFromAssignee
        );
        next();
    }
}

export default new UserTaskFromAssigneeMiddleware();
