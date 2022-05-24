export interface CreateActivityDto {
    activity: string;

    userId: number;

    projectId?: number;

    projectActivityId?: number;

    subDetailProjectActivityId?: number;

    createdAt?: Date;
}
