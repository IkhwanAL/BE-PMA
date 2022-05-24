import moment from 'moment';
import MysqlPrisma from '../../common/services/mysql.service.config';
import { CreateActivityDto } from '../dto/create.activity.dto';

class ActivityDao {
    async getActivityPerIdProject(idProject: number) {
        return MysqlPrisma.activity.findMany({
            where: {
                projectId: idProject,
            },
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        });
    }

    async getActivityPerIdUser(idUser: number) {
        return MysqlPrisma.activity.findMany({
            where: {
                userId: idUser,
            },
        });
    }

    async createActivity(resource: CreateActivityDto) {
        return MysqlPrisma.activity.create({
            data: {
                ...resource,
                createdAt: moment().toDate(),
            },
        });
    }
}

export default new ActivityDao();
