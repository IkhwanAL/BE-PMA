import { Request, Response } from 'express';
import { HttpResponse } from '../../common/services/http.service.config';
import { CreateSubProjectActivityDto } from '../dto/create.subDetail.dto';
import subProjectActivityService from '../service/subProjectActivity.service';

class SubProjectActivity {
    public addSubProjectActivity = async (req: Request, res: Response) => {
        try {
            const { id, email, idProject, idSubProjectActivity, ...rest } =
                req.body;

            const payload = {
                detailProyekId: idSubProjectActivity,
                description: rest.description,
                isComplete: rest.isComplete ?? false,
            } as CreateSubProjectActivityDto;

            const post =
                await subProjectActivityService.addDetailActivityProject(
                    payload
                );

            return HttpResponse.Created(res, post);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };

    public isCompletePatch = async (req: Request, res: Response) => {
        try {
            const { idSubProjectActivity, isComplete, ...rest } = req.body;

            await subProjectActivityService.patchisComplete(
                idSubProjectActivity,
                isComplete
            );

            return HttpResponse.Created(res, {});
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };
}

export default new SubProjectActivity();
