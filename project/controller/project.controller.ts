import {
    project,
    projectactivity,
    subdetailprojectactivity,
    userteam,
} from '@prisma/client';
import { Request, Response } from 'express';
import { ProjecType } from '../../common/@types/project.types';
import { CommonController } from '../../common/controller/controller.config';
import { CPM } from '../../common/cpm/calculate.cpm.config';
import { HttpResponse } from '../../common/services/http.service.config';
import subProjectActivityDao from '../../subProjectActivity/daos/subProjectActivity.dao';
import projectDao from '../daos/project.dao';
import { CreateProjectDto } from '../dto/create.project.dto';
import projectService from '../service/project.service';

class ProjectController extends CommonController {
    async createProject(req: Request, res: Response) {
        try {
            const payload = {
                projectName: req.body.projectName,
                projectDescription: req.body.projectDescription,
            } as CreateProjectDto;

            const project = await projectService.create(req.body.id, payload);

            return HttpResponse.Ok(res, {
                projectId: project.projectId,
                projectName: project.projectName,
                projectDescription: project.projectDescription,
            });
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async deleteProject(req: Request, res: Response) {
        try {
            const { idProject } = req.params;

            if (!idProject) {
                return HttpResponse.BadRequest(res);
            }

            await projectService.deleteProject(req.body.idProject);

            return HttpResponse.NoContent(res);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async getAllProject(req: Request, res: Response) {
        try {
            const project = await projectService.getAll(req.body.id);
            return HttpResponse.Ok(res, project);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async getOneSmallProject(req: Request, res: Response) {
        try {
            const project = await projectService.getOneSmallColumn(
                req.body.id,
                req.body.idProject
            );
            console.log(project);
            return HttpResponse.Ok(res, project);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async patchProject(req: Request, res: Response) {
        try {
            const allowedPatch = ['projectName', 'projectDescription'];

            const { id, email, idProject, ...rest } = req.body;

            for (const key in rest) {
                const find = allowedPatch.findIndex((x) => x === key);

                if (find == -1) {
                    return HttpResponse.BadRequest(res);
                }
            }

            const project = await projectService.patchProject(
                id,
                idProject,
                rest
            );

            return HttpResponse.Created(res, {
                projectId: project.projectId,
                projectName: project.projectName,
                projectDescription: project.projectDescription,
            });
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    public getOneProject = async (req: Request, res: Response) => {
        try {
            let project = await projectService.getOne(
                req.body.id,
                req.body.idProject
            );
            if (!project) {
                project = await projectService.getOneWithIdUserTeam(
                    req.body.id,
                    req.body.idProject
                );
            }

            const NewProject = await this.calc(project, req.body.idProject);
            const NewNewProject = await this.countProjectActivityProgress(
                NewProject,
                res
            );

            return HttpResponse.Ok(res, NewNewProject);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };

    async countProjectActivityProgress(_project: ProjecType, res: Response) {
        const TemporaryProject = _project;
        try {
            for (const iterator in _project.projectactivity) {
                const ProjectAct = _project.projectactivity[iterator];
                const total =
                    await subProjectActivityDao.countProgressPerProjectActivity(
                        ProjectAct.projectActivityId
                    );
                const done =
                    await subProjectActivityDao.countProgressPerProjectActivity(
                        ProjectAct.projectActivityId,
                        true
                    );

                TemporaryProject.projectactivity[iterator].progress =
                    (100 * done) / total;
            }
            return TemporaryProject;
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async calculate(req: Request, res: Response) {
        try {
            let project = (await projectService.getOne(
                req.body.id,
                req.body.idProject
            )) as ProjecType;
            if (!project) {
                project = (await projectService.getOneWithIdUserTeam(
                    req.body.id,
                    req.body.idProject
                )) as ProjecType;
            }

            const cpm = new CPM(project);

            cpm.calculate();

            const saveDeadLineProject = await projectDao.patchDeadline(
                req.body.idProject,
                cpm.getDeadLine()
            );

            const getFloat = cpm.getCalculate();

            project.deadline = saveDeadLineProject.deadline;
            project.deadlineInString = saveDeadLineProject.deadlineInString;

            const temp: Array<
                projectactivity & {
                    f: number;
                    critical: boolean;
                    subdetailprojectactivity: subdetailprojectactivity[];
                }
            > = [];

            for (const iterator of project.projectactivity) {
                const calc = getFloat[iterator.projectActivityId];

                temp.push({
                    ...iterator,
                    f: calc.f,
                    critical: calc.critical,
                    subdetailprojectactivity: iterator.subdetailprojectactivity,
                });
            }

            project.projectactivity = temp;

            return HttpResponse.Ok(res, project);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    public GetUserTeam = async (req: Request, res: Response) => {
        try {
            const userteam = await projectService.getAllUserTeamWithIdProject(
                req.body.idProject
            );

            return HttpResponse.Ok(res, userteam);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };

    public GetLeader = async (req: Request, res: Response) => {
        try {
            const user = await projectService.getLeaderProject(
                req.body.idProject
            );

            return HttpResponse.Ok(res, user);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };
}

export default new ProjectController();
