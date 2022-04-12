import { projectactivity_position } from '@prisma/client';

export interface CreateProjectActivityDto {
    projectId: number;
    name: string;
    critical?: boolean;
    progress?: number;
    position?: projectactivity_position;
    timeToComplete: number;
    status?: boolean;
    description: string;
    parent?: string;
    child?: string;
    subdetailprojectactivity?: Array<{
        subDetailProjectActivityId?: number;
        detailProyekId: number;
        description: string;
        isComplete?: boolean;
    }>;
}
