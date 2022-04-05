import { Request, Response } from 'express';
import { HttpResponse } from '../../common/services/http.service.config';

class SubProjectActivity {
    public addSubProjectActivity = async (req: Request, res: Response) => {
        try {
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };
}

export default new SubProjectActivity();
