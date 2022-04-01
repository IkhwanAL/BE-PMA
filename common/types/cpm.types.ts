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

export interface ProjectActivity {
    projectActivityId: number;
    projectId: number;
    name: string;
    critical?: any;
    progress: number;
    position: string;
    timeToComplete: number;
    status: boolean;
    description: string;
    parent?: any;
    child?: any;
    createdAt: string;
    updatedAt: string;
}

export interface UserTeam {
    teamId: number;
    userId: number;
    projectId: number;
    role: string;
    addedAt: string;
    User: User;
}

export interface User {
    id: number;
    username: string;
    email: string;
    firstName?: any;
    lastName?: any;
}
