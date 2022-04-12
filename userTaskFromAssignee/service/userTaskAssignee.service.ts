import userTaskAssigneeDao from '../daos/userTaskAssignee.dao';
import { CraeteUserTaskFromAssigneeDto } from '../dto/create.userTaskAssignee.dto';

class UserTaskFromAssigneeService {
    async addUserForThisTask(resource: CraeteUserTaskFromAssigneeDto) {
        return userTaskAssigneeDao.add(resource);
    }

    async deleteUserFromThisTask(idTask: number) {
        return userTaskAssigneeDao.delete(idTask);
    }
}

export default new UserTaskFromAssigneeService();
