import {
    project,
    projectactivity,
    subdetailprojectactivity,
    userteam,
} from '@prisma/client';
import projectDao from '../../project/daos/project.dao';
import { CPM } from '../cpm/calculate.cpm.config';
import { ProjecType } from '../@types/project.types';

export class CommonController {
    protected async calc(
        _project: project & {
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
                subdetailprojectactivity: subdetailprojectactivity[];
            })[];
        },
        idProject: number
    ): Promise<ProjecType> {
        const cpm = new CPM(_project, _project.startDate);

        cpm.calculate();

        if (cpm.getDeadLine() !== 0) {
            const saveDeadLineProject = await projectDao.patchDeadline(
                idProject,
                cpm.getDeadLine(),
                null,
                cpm.getDate()
            );

            const getFloat = cpm.getCalculate();

            if (Object.keys(getFloat).length !== 0) {
                _project.deadline = saveDeadLineProject.deadline;
                _project.deadlineInString =
                    saveDeadLineProject.deadlineInString;

                const temp: Array<
                    projectactivity & {
                        f: number;
                        critical: boolean;
                        subdetailprojectactivity: subdetailprojectactivity[];
                    }
                > = [];

                for (const iterator of _project.projectactivity) {
                    const calc = getFloat[iterator.projectActivityId];

                    temp.push({
                        ...iterator,
                        f: calc.f,
                        critical: calc.critical,
                    });
                }

                _project.projectactivity = temp;
            }
        } else {
            _project.deadline = null;
            _project.deadlineInString = '0';
        }

        return _project as ProjecType;
    }
}
