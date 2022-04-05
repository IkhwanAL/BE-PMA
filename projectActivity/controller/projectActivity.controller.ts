import { Position, Project, ProjectActivity, UserTeam } from '@prisma/client';
import { Request, Response } from 'express';
import { bodyBlacklist } from 'express-winston';
import { CPM } from '../../common/cpm/calculate.cpm.config';
import { HttpResponse } from '../../common/services/http.service.config';
import { ProjectCpm } from '../../common/types/cpm.types';
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
            const payload = {
                projectId: req.body.idProject,
                name: req.body.name,
                description: req.body.description,
                timeToComplete: req.body.timeToComplete,
                child: req.body.child ?? '',
                critical: req.body.critical ?? false,
                parent: req.body.parent ?? '',
                position: req.body.position ?? Position.To_Do,
                progress: req.body.progress ?? 0,
                status: req.body.status ?? false,
            } as CreateProjectActivityDto;

            await projectActivityService.createNewProject(payload);

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

            const NewProject = this.calc(project, req.body.idProject);

            return HttpResponse.Created(res, NewProject);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async patchProjectActivity(req: Request, res: Response) {
        try {
            const { idProjectActivity, idProject, id, email, ...rest } =
                req.body;
            const patchProjectActivity = {
                ...req.body,
            } as PatchProjectActivityDto;

            await projectActivityService.patchProjectActivity(
                idProjectActivity,
                rest
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

            const NewProject = this.calc(project, req.body.idProject);

            return HttpResponse.Created(res, NewProject);
        } catch (error) {
            console.log(error);
            return HttpResponse.InternalServerError(res);
        }
    }

    async deleteProjectActivity(req: Request, res: Response) {
        try {
            const get = await projectActivityService.deleteProjectActivity(
                req.body.idProjectActivity
            );

            let project = await projectService.getOne(
                req.body.id,
                get.projectId
            );

            if (!project) {
                project = await projectService.getOneWithIdUserTeam(
                    req.body.id,
                    get.projectId
                );
            }

            const NewProject = this.calc(project, get.projectId);

            return HttpResponse.Ok(res, NewProject);
        } catch (error) {
            console.log(error);
            return HttpResponse.InternalServerError(res);
        }
    }

    private async calc(
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
            ProjectActivity: ProjectActivity[];
        },
        idProject: number
    ) {
        const cpm = new CPM(project);

        cpm.calculate();

        const saveDeadLineProject = await projectDao.patchDeadline(
            idProject,
            cpm.getDeadLine()
        );

        const getFloat = cpm.getCalculate();

        project.deadline = saveDeadLineProject.deadline;
        project.deadlineInString = saveDeadLineProject.deadlineInString;

        const temp: Array<
            ProjectActivity & {
                f: number;
                critical: boolean;
            }
        > = [];

        for (const iterator of project.ProjectActivity) {
            const calc = getFloat[iterator.projectActivityId];

            temp.push({ ...iterator, f: calc.f, critical: calc.critical });
        }

        project.ProjectActivity = temp;

        return project;
    }
}

export default new ProjectACtivityController();
