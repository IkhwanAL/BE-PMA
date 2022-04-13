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
    userteam: (userteam & {
        user: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            username: string;
        };
    })[];
    projectactivity: (projectactivity & {
        f?: number;
        critical?: boolean;
        subdetailprojectactivity: subdetailprojectactivity[];
    })[];
};

export type ProjectActivityType = projectactivity & {
    subdetailprojectactivity: subdetailprojectactivity[];
};

// export type
