import subProjectActivityDao from '../daos/subProjectActivity.dao';
import { CreateSubProjectActivityDto } from '../dto/create.subDetail.dto';
import { PatchSubProjectActivity } from '../dto/patch.subDetail.dto';

class SubProjectActivityService {
    public async addDetailActivityProject(
        resource: CreateSubProjectActivityDto
    ) {
        return subProjectActivityDao.add(resource);
    }

    public async patchDetailActivityProject(
        idSubProjectActivity: number,
        resource: PatchSubProjectActivity
    ) {
        return subProjectActivityDao.patchById(idSubProjectActivity, resource);
    }

    public async deleteDetailProjectActivity(idSubProjectActivity: number) {
        return subProjectActivityDao.deleteById(idSubProjectActivity);
    }

    public async patchisComplete(
        idSubProjectActivity: number,
        isComplete: boolean
    ) {
        return subProjectActivityDao.changeIsComplete(
            idSubProjectActivity,
            isComplete
        );
    }
}

export default new SubProjectActivityService();
