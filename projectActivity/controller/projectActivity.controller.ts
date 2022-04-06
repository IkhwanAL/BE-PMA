import { Position } from '@prisma/client';
import { Request, Response } from 'express';
import { CommonController } from '../../common/controller/controller.config';
import { HttpResponse } from '../../common/services/http.service.config';
import projectService from '../../project/service/project.service';
import subProjectActivityDao from '../../subProjectActivity/daos/subProjectActivity.dao';
import { CreateSubProjectActivityDto } from '../../subProjectActivity/dto/create.subDetail.dto';
import { CreateProjectActivityDto } from '../dto/create.projectActivity.dto';
import projectActivityService from '../service/projectActivity.service';

class ProjectACtivityController extends CommonController {
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

    public createProjectActivity = async (req: Request, res: Response) => {
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
                SubDetailProjectActivity:
                    req.body.SubDetailProjectActivity ?? [],
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

            const NewProject = await this.calc(project, req.body.idProject);

            return HttpResponse.Created(res, NewProject);
        } catch (error) {
            console.log(error);
            return HttpResponse.InternalServerError(res);
        }
    };

    public patchProjectActivity = async (req: Request, res: Response) => {
        try {
            const { idProjectActivity, idProject, id, email, ...rest } =
                req.body;

            const get = await projectActivityService.patchProjectActivity(
                idProjectActivity,
                rest
            );

            const SubDetail =
                rest.SubDetailProjectActivity as CreateSubProjectActivityDto[];

            for (const key in SubDetail) {
                const payload = {
                    description: SubDetail[key].description,
                    detailProyekId: idProjectActivity,
                    isComplete: SubDetail[key].isComplete ?? false,
                } as CreateSubProjectActivityDto;

                await subProjectActivityDao.patchById(
                    SubDetail[key].subDetailProjectActivityId,
                    payload
                );
            }

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

            const NewProject = await this.calc(project, get.projectId);

            return HttpResponse.Created(res, NewProject);
        } catch (error) {
            console.log(error);
            return HttpResponse.InternalServerError(res);
        }
    };

    public deleteProjectActivity = async (req: Request, res: Response) => {
        try {
            const getProjectActivity =
                await projectActivityService.getProjectACtivityVertex(
                    req.body.idProjectActivity
                );

            for (const iterator of getProjectActivity) {
                const parentSplit = iterator.parent.split(',');

                const parentResource = parentSplit.filter(
                    (x) => x != req.body.idProjectActivity
                );

                const joinSplitParent = parentResource.join(',');

                await projectActivityService.patchProjectActivity(
                    iterator.projectActivityId,
                    { parent: joinSplitParent }
                );
            }

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

            const NewProject = await this.calc(project, get.projectId);

            return HttpResponse.Ok(res, NewProject);
        } catch (error) {
            console.log(error);
            return HttpResponse.InternalServerError(res);
        }
    };
}

export default new ProjectACtivityController();
