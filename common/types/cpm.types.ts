import {
    Project,
    ProjectActivity,
    SubDetailProjectActivity,
    UserTeam,
} from '@prisma/client';

export interface ProjectCpm {
    projectId: number;
    projectName: string;
    projectDescription: string;
    deadline?: Date;
    deadlineInString?: string;
    userOwner: number;
    createdAt: string;
    updatedAt: string;
    UserTeam: UserTeam[];
    ProjectActivity: ProjectActivity[];
}
export type ProjecType = Project & {
    UserTeam: (UserTeam & {
        User: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            username: string;
        };
    })[];
    ProjectActivity: (ProjectActivity & {
        f?: number;
        critical?: boolean;
        SubDetailProjectActivity: SubDetailProjectActivity[];
    })[];
};
