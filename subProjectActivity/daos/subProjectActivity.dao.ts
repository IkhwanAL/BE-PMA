import MysqlPrisma from '../../common/services/mysql.service.config';
import { PatchProjectActivityDto } from '../../projectActivity/dto/patch.projectActivity.dto';
import { CreateSubProjectActivityDto } from '../dto/create.subDetail.dto';
import { PatchSubProjectActivity } from '../dto/patch.subDetail.dto';

class SubProjectActivtyDao {
    public async add(resource: CreateSubProjectActivityDto) {
        return MysqlPrisma.subDetailProjectActivity.create({
            data: {
                ...resource,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    public async patchById(
        idSubProjectActivity: number,
        resource: PatchSubProjectActivity
    ) {
        return MysqlPrisma.subDetailProjectActivity.update({
            where: {
                subDetailProjectActivityId: idSubProjectActivity,
            },
            data: {
                ...resource,
                updatedAt: new Date(),
            },
        });
    }

    public async deleteById(idSubProjectActivity: number) {
        return MysqlPrisma.subDetailProjectActivity.delete({
            where: {
                subDetailProjectActivityId: idSubProjectActivity,
            },
        });
    }

    public changeIsComplete(idSubProjectActivity: number, isComplete: boolean) {
        return MysqlPrisma.subDetailProjectActivity.update({
            where: {
                subDetailProjectActivityId: idSubProjectActivity,
            },
            data: {
                isComplete: isComplete,
            },
        });
    }
}

export default new SubProjectActivtyDao();
