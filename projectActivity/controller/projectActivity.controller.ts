import { projectactivity_position, usertaskfromassignee } from '@prisma/client';
import { Request, Response } from 'express';
import { bodyBlacklist } from 'express-winston';
import { CPM } from '../../common/cpm/calculate.cpm.config';
import { HttpResponse } from '../../common/services/http.service.config';

import projectDao from '../../project/daos/project.dao';
import projectService from '../../project/service/project.service';
import { CreateProjectActivityDto } from '../dto/create.projectActivity.dto';
import { PatchProjectActivityDto } from '../dto/patch.projectActivity.dto';
import projectActivityService from '../service/projectActivity.service';

class ProjectACtivityController {
    async getProjectActivityBaseOfIdProject(req: Request, res: Response) {
        try {
            const projectActivity =
                await projectActivityService.getAllProjectActivity(
                    req.body.id,
                    req.body.idProject
                );
            if (projectActivity.length !== 0) {
                // projectActivity[0].
                return HttpResponse.Ok(res, projectActivity);
            }

            const projectActivityUserTeam =
                await projectActivityService.getAllProjectActivityForTeam(
                    req.body.id,
                    req.body.idProject
                );

            if (projectActivityUserTeam.length !== 0) {
                return HttpResponse.Ok(res, projectActivityUserTeam);
            }

            return HttpResponse.NotFound(res);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async createProjectActivity(req: Request, res: Response) {
        try {
            const usertask = [];
            const subdetailprojectactivity = [];

            for (const iterator of req.body.usertaskfromassignee) {
                const payload = {
                    idUser: iterator,
                };

                usertask.push(payload);
            }

            for (const iterator of req.body.subdetailprojectactivity) {
                const { subDetailProjectActivityId, ...rest } = iterator;
                subdetailprojectactivity.push({ ...rest });
            }

            const payload = {
                projectId: req.body.idProject,
                name: req.body.name,
                description: req.body.description,
                timeToComplete: req.body.timeToComplete,
                child: req.body.child ?? '',
                critical: req.body.critical ?? false,
                parent: req.body.parent ?? '',
                position: req.body.position ?? projectactivity_position.To_Do,
                startDate: req.body.startDate ?? new Date(),
                progress: req.body.progress ?? 0,
                status: req.body.status ?? false,
                usertaskfromassignee: usertask ?? [],
                subdetailprojectactivity: subdetailprojectactivity ?? [],
            } as CreateProjectActivityDto;

            const projectAct = await projectActivityService.createNewProject(
                payload
            );

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

            const cpm = new CPM(project);

            cpm.calculate();

            const saveDeadLineProject = await projectDao.patchDeadline(
                req.body.idProject,
                cpm.getDeadLine(),
                project.startDate
            );

            project.deadline = saveDeadLineProject.deadline;
            project.deadlineInString = saveDeadLineProject.deadlineInString;

            return HttpResponse.Created(res, project);
        } catch (error) {
            console.log(error);
            return HttpResponse.InternalServerError(res);
        }
    }

    async patchProjectActivity(req: Request, res: Response) {
        try {
            const { idProjectActivity, idProject, id, email, ...rest } =
                req.body;

            const IdProjectActivityParams = req.body.projectActivityId;

            const projectActivity =
                await projectActivityService.patchProjectActivity(
                    IdProjectActivityParams,
                    rest,
                    id
                );

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

            const cpm = new CPM(project);

            cpm.calculate();

            await projectDao.patchDeadline(
                req.body.idProject,
                cpm.getDeadLine(),
                project.startDate
            );

            return HttpResponse.Created(res, projectActivity);
        } catch (error) {
            console.log(error);
            return HttpResponse.InternalServerError(res);
        }
    }

    async deleteProjectActivity(req: Request, res: Response) {
        try {
            const getProjectActivity =
                await projectActivityService.getProjectACtivityVertex(
                    req.body.idProjectActivity
                );

            for (const iterator of getProjectActivity) {
                const parentSplit = iterator.parent.split(',');

                const parentResource = parentSplit.filter(
                    (x) => x !== req.body.idProjectActivity
                );
                const joinSplitParent = parentResource.join(',');

                await projectActivityService.patchProjectActivity(
                    iterator.projectActivityId,
                    { parent: joinSplitParent }
                );
            }

            await projectActivityService.deleteProjectActivity(
                req.body.idProjectActivity
            );

            return HttpResponse.NoContent(res);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    public movingCardFromPosistionAToPositionB = async (
        req: Request,
        res: Response
    ) => {
        try {
            const { idProjectActivity, idProject, id, email, ...rest } =
                req.body;

            const projectActivity =
                await projectActivityService.MovingCardPosisition(
                    idProjectActivity,
                    {
                        position: rest.position,
                    }
                );
            return HttpResponse.Ok(res, {
                projectActivityId: projectActivity.projectActivityId,
                position: projectActivity.position,
            });
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };

    public getProjectActivityByProjectActivityId = async (
        req: Request,
        res: Response
    ) => {
        try {
            const projectActivity =
                await projectActivityService.getOneProjectActivity(
                    req.body.idProjectActivity
                );
            const ParentActivity: Array<any> = [];

            if (projectActivity.parent) {
                const Split = projectActivity.parent.split(
                    ','
                ) as Array<string>;

                if (projectActivity.parent) {
                    for (let index = 0; index < Split.length; index++) {
                        const element = parseInt(Split[index]);

                        const Parent = await projectActivityService.getSimple(
                            element
                        );
                        const Payload = [element, Parent.name];
                        ParentActivity.push(Payload);
                    }
                }
            }

            const NewProjectActivity = {
                ...projectActivity,
                ['ParentActivityName']: ParentActivity,
            };
            return HttpResponse.Ok(res, NewProjectActivity);
        } catch (error) {
            console.log(error);
            return HttpResponse.InternalServerError(res);
        }
    };

    public getOneSimple = async (req: Request, res: Response) => {
        try {
            const projectActivity = await projectActivityService.getSimple(
                req.body.idProjectActivity
            );

            return HttpResponse.Ok(res, projectActivity);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };

    public getAllProjectActivityWithIdProject = async (
        req: Request,
        res: Response
    ) => {
        try {
            const { idProject } = req.body;

            const activity =
                await projectActivityService.getAllProjectActivityBasedOnidProject(
                    idProject
                );
            // console.log(activity);
            return HttpResponse.Ok(res, activity);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };
}

export default new ProjectACtivityController();
