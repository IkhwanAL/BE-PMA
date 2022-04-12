import {
    project,
    projectactivity,
    subdetailprojectactivity,
    userteam,
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
    UserTeam: userteam[];
    ProjectActivity: projectactivity[];
}

export type ProjecType = project & {
    UserTeam: (userteam & {
        User: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            username: string;
        };
    })[];
    ProjectActivity: (projectactivity & {
        f?: number;
        critical?: boolean;
        SubDetailProjectActivity: subdetailprojectactivity[];
    })[];
};

export type ProjectActivityType = projectactivity & {
    SubDetailProjectActivity: subdetailprojectactivity[];
};
