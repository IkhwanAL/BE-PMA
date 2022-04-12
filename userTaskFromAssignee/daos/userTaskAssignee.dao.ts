import MysqlPrisma from '../../common/services/mysql.service.config';
import { CraeteUserTaskFromAssigneeDto } from '../dto/create.userTaskAssignee.dto';

class UserTaskFromAssigneDao {
    async add(resource: CraeteUserTaskFromAssigneeDto) {
        return MysqlPrisma.usertaskfromassignee.create({
            data: {
                ...resource,
                createdAt: new Date(),
            },
        });
    }

    async delete(idTask: number) {
        return MysqlPrisma.usertaskfromassignee.delete({
            where: {
                idTask: idTask,
            },
        });
    }
}

export default new UserTaskFromAssigneDao();
