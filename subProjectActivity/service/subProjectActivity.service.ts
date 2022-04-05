import subProjectActivityDao from '../daos/subProjectActivity.dao';
import { CreateSubProjectActivityDto } from '../dto/create.subDetail.dto';
import { PatchSubProjectActivity } from '../dto/patch.subDetail.dto';

class SubProjectActivityService {
    public async addDetailActivityProject(
        resource: CreateSubProjectActivityDto
    ) {
        return;
    }

    public async patchDetailActivityProject(
        idSubProjectActivity: number,
        resource: PatchSubProjectActivity
    ) {
        return subProjectActivityDao.patchById(idSubProjectActivity, resource);
    }
}

export default new SubProjectActivityService();
