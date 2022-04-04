import { Position } from '@prisma/client';
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
                cpm.getDeadLine()
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
            const patchProjectActivity = {
                ...req.body,
            } as PatchProjectActivityDto;

            // console.log(patchProjectActivity);
            const projectActivity =
                await projectActivityService.patchProjectActivity(
                    idProjectActivity,
                    rest
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
}

export default new ProjectACtivityController();
