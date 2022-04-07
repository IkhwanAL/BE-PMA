import {
    Project,
    ProjectActivity,
    SubDetailProjectActivity,
    UserTeam,
} from '@prisma/client';
import projectDao from '../../project/daos/project.dao';
import { CPM } from '../cpm/calculate.cpm.config';
import { ProjecType } from '../types/project.types';

export class CommonController {
    protected async calc(
        project: Project & {
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
                SubDetailProjectActivity: SubDetailProjectActivity[];
            })[];
        },
        idProject: number
    ): Promise<ProjecType> {
        const cpm = new CPM(project);

        cpm.calculate();

        const saveDeadLineProject = await projectDao.patchDeadline(
            idProject,
            cpm.getDeadLine()
        );

        const getFloat = cpm.getCalculate();

        if (Object.keys(getFloat).length !== 0) {
            project.deadline = saveDeadLineProject.deadline;
            project.deadlineInString = saveDeadLineProject.deadlineInString;

            const temp: Array<
                ProjectActivity & {
                    f: number;
                    critical: boolean;
                    SubDetailProjectActivity: SubDetailProjectActivity[];
                }
            > = [];

            for (const iterator of project.ProjectActivity) {
                const calc = getFloat[iterator.projectActivityId];

                temp.push({ ...iterator, f: calc.f, critical: calc.critical });
            }

            project.ProjectActivity = temp;
        }

        return project as ProjecType;
    }
}
