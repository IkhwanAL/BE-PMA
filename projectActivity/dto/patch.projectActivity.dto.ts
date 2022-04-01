import { CreateProjectActivityDto } from './create.projectActivity.dto';

export interface PatchProjectActivityDto
    extends Partial<CreateProjectActivityDto> {}
