import { Position } from '@prisma/client';

export interface CreateProjectActivityDto {
    projectId: number;
    name: string;
    critical?: boolean;
    progress?: number;
    position?: Position;
    timeToComplete: number;
    status?: boolean;
    description: string;
    parent?: string;
    child?: string;
}
