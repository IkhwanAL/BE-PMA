import activityDao from '../daos/activity.dao';
import { CreateActivityDto } from '../dto/create.activity.dto';

class ActivityService {
    public createAsync = async (resource: CreateActivityDto) => {
        return activityDao.createActivity(resource);
    };

    public getActivityPerIdProject = async (idProject?: number) => {
        return activityDao.getActivityPerIdProject(idProject);
    };

    public getActivityPerIdUser = async (idUser: number) => {
        return activityDao.getActivityPerIdUser(idUser);
    };
}

export default new ActivityService();
