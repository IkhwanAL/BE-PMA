import { Request, Response } from 'express';
import { CommonController } from '../../common/controller/controller.config';
import { HttpResponse } from '../../common/services/http.service.config';
import activityService from '../service/activity.service';

class ActivityController extends CommonController {
    public GetAllActivityUserWithIdProject = async (
        req: Request,
        res: Response
    ) => {
        try {
            // Get All Activity With IdProject
            const Activity = await activityService.getActivityPerIdProject(
                req.body.idProject
            );

            return HttpResponse.Ok(res, Activity);
        } catch (error) {
            console.log(error);
            return HttpResponse.InternalServerError(res);
        }
    };

    public GetRecentActivityPerUser = async (req: Request, res: Response) => {
        try {
            const ActivityPerUser = await activityService.getActivityPerIdUser(
                req.body.id
            );

            return HttpResponse.Ok(res, ActivityPerUser);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };
}

export default new ActivityController();
