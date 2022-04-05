import { ProjectActivity } from '@prisma/client';
import { Request, Response } from 'express';
import { CPM } from '../../common/cpm/calculate.cpm.config';
import { HttpResponse } from '../../common/services/http.service.config';
import projectDao from '../daos/project.dao';
import { CreateProjectDto } from '../dto/create.project.dto';
import projectService from '../service/project.service';

class ProjectController {
    async createProject(req: Request, res: Response) {
        try {
            const payload = {
                projectName: req.body.projectName,
                projectDescription: req.body.projectDescription,
            } as CreateProjectDto;

            const project = await projectService.create(req.body.id, payload);

            return HttpResponse.Ok(res, {
                name: project.projectName,
                description: project.projectDescription,
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
                projectName: project.projectName,
                projectDescription: project.projectDescription,
            });
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async getOneProject(req: Request, res: Response) {
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

            return HttpResponse.Ok(res, project);
        } catch (error) {
            console.log(error);
            return HttpResponse.InternalServerError(res);
        }
    }

    async calculate(req: Request, res: Response) {
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

            return HttpResponse.Ok(res, project);
        } catch (error) {
            console.log(error);
            return HttpResponse.InternalServerError(res);
        }
    }
}

export default new ProjectController();
