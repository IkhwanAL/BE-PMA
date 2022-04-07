import MysqlPrisma from '../../common/services/mysql.service.config';
import { CreateActivityDto } from '../dto/create.activity.dto';

class ActivityDao {
    async getActivity(idProject: number) {
        return MysqlPrisma.activity.findMany({
            where: {
                projectId: idProject,
            },
        });
    }

    async createActivity(resource: CreateActivityDto) {
        return MysqlPrisma.activity.create({
            data: {
                ...resource,
            },
        });
    }
}

export default new ActivityDao();
