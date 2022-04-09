import { Request, Response } from 'express';
import { HttpResponse } from '../../common/services/http.service.config';

class UserTaskFromAssigneController {
    public add = async (req: Request, res: Response) => {
        try {
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };
}

export default new UserTaskFromAssigneController();
