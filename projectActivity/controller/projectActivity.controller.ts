import {
    project,
    projectactivity,
    projectactivity_position,
    subdetailprojectactivity,
    usertaskfromassignee,
    userteam,
} from '@prisma/client';
import { Request, Response } from 'express';
import { bodyBlacklist } from 'express-winston';
import moment from 'moment';
import { CreateActivityDto } from '../../activity/dto/create.activity.dto';
import activityService from '../../activity/service/activity.service';
import { CPM } from '../../common/cpm/calculate.cpm.config';
import { EmailNodeMailer } from '../../common/email/email.config.service';
import {
    ManipulateDataProjectActivityTemplateEmail,
    ProjectActivityContext,
    StatsActivity,
} from '../../common/email/email.template';
import { RestApiGetUserById } from '../../common/interfaces/api.interface';
import { HttpResponse } from '../../common/services/http.service.config';
import mysqlServiceConfig from '../../common/services/mysql.service.config';

import projectDao from '../../project/daos/project.dao';
import projectService from '../../project/service/project.service';
import subProjectActivityDao from '../../subProjectActivity/daos/subProjectActivity.dao';
import userService from '../../users/services/user.service';
import userteamService from '../../userTeam/service/userteam.service';
import { CreateProjectActivityDto } from '../dto/create.projectActivity.dto';
import { PatchProjectActivityDto } from '../dto/patch.projectActivity.dto';
import projectActivityService from '../service/projectActivity.service';
import 'dotenv/config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import userteamDao from '../../userTeam/daos/userteam.dao';
import projectActivityDao from '../daos/projectActivity.dao';

class ProjectACtivityController {
    Email = new EmailNodeMailer();

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

    // Membuat Aktifitas Project Baru dan Menyimpan Aktitifitas User
    public createProjectActivity = async (req: Request, res: Response) => {
        try {
            const usertask = [];
            const subdetailprojectactivity = [];

            if (req.body.usertaskfromassignee) {
                for (const iterator of req.body.usertaskfromassignee) {
                    const payload = {
                        idUser: iterator,
                    };

                    usertask.push(payload);
                }
            }

            if (req.body.subdetailprojectactivity) {
                for (const iterator of req.body.subdetailprojectactivity) {
                    const { subDetailProjectActivityId, ...rest } = iterator;
                    subdetailprojectactivity.push({ ...rest });
                }
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
                progress: req.body.progress ?? 0,
                status: req.body.status ?? false,
                usertaskfromassignee: usertask ?? [],
                subdetailprojectactivity: subdetailprojectactivity ?? [],
            } as CreateProjectActivityDto;

            const projectAct = await projectActivityService.createNewProject(
                payload
            );

            const Percentage = await this.CalculateProgress(
                projectAct.projectActivityId,
                subdetailprojectactivity
            );

            let project = await projectService.GetOneRaw(
                req.body.id,
                req.body.idProject
            );
            if (!project) {
                project = await projectService.getOneWithIdUserTeam(
                    req.body.id,
                    req.body.idProject
                );
            }

            const cpm = new CPM(project, project.startDate);

            cpm.calculate();

            if (cpm.getDeadLine() !== 0) {
                const saveDeadLineProject = await projectDao.patchDeadline(
                    req.body.idProject ?? payload.projectId,
                    cpm.getDeadLine(),
                    null,
                    cpm.getDate()
                );
                project.deadline = saveDeadLineProject.deadline;
                project.deadlineInString = saveDeadLineProject.deadlineInString;
            } else {
                project.deadline = null;
                project.deadlineInString = '0';
            }

            const PayloadActivity: CreateActivityDto = {
                activity:
                    'Membuat Aktifitas Project Baru ' + `"${projectAct.name}"`,
                userId: req.body.id,
                projectId: req.body.idProject,
            };

            await activityService.createAsync(PayloadActivity);

            await this.SendEmailNotification(
                req.body.id,
                project,
                Percentage,
                {
                    h2:
                        Percentage >= 100
                            ? `Project Activity ${payload.name} Selesai`
                            : `Create Project Activity`,
                    p: 'Proyek Activity Telah Di Buat',
                },
                StatsActivity.Create
            );

            return HttpResponse.Created(res, project);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };

    private CalculateProgress = async (
        idProjectActivity: number,
        subdetailprojectactivity: subdetailprojectactivity[]
    ) => {
        if (subdetailprojectactivity.length == 0) {
            return;
        }
        const FindTotalSubDetail = subdetailprojectactivity.length;

        const TotalCompleted = subdetailprojectactivity.filter(
            (x) => x.isComplete === true
        ).length;

        const Percentage = (TotalCompleted / FindTotalSubDetail) * 100;

        await projectActivityService.PatchProgress(
            idProjectActivity,
            Math.ceil(Percentage)
        );

        return Percentage;
    };

    public patchProjectActivity = async (req: Request, res: Response) => {
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

            const FindSubDetailActivity =
                await subProjectActivityDao.getBasedOnIdProjectActivity(
                    IdProjectActivityParams
                );

            const Percentage = await this.CalculateProgress(
                +IdProjectActivityParams,
                FindSubDetailActivity
            );

            let project = await projectService.GetOneRaw(
                req.body.id,
                req.body.idProject
            );

            if (!project) {
                project = await projectService.getOneWithIdUserTeam(
                    req.body.id,
                    req.body.idProject
                );
            }

            const cpm = new CPM(project, project.startDate);

            cpm.calculate();

            if (cpm.getDeadLine() !== 0) {
                const saveDeadLineProject = await projectDao.patchDeadline(
                    req.body.idProject ?? project.projectId,
                    cpm.getDeadLine(),
                    null,
                    cpm.getDate()
                );
                project.deadline = saveDeadLineProject.deadline;
                project.deadlineInString = saveDeadLineProject.deadlineInString;
            } else {
                project.deadline = null;
                project.deadlineInString = '0';
            }

            const PayloadActivity: CreateActivityDto = {
                activity:
                    'Update Aktifitas Project ' + `${projectActivity.name}`,
                userId: req.body.id,
                projectId: req.body.idProject,
            };

            await activityService.createAsync(PayloadActivity);

            await this.SendEmailNotification(
                req.body.id,
                project,
                Percentage,
                {
                    h2:
                        Percentage >= 100
                            ? `Project Activity ${projectActivity.name} Selesai`
                            : `Update Project Activity`,
                    p: 'Proyek Activity Telah Di Update',
                },
                StatsActivity.Update
            );

            return HttpResponse.Created(
                res,
                projectActivity,
                'Berhasil Update '
            );
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };

    public Sort = (
        Project: project & {
            projectactivity: projectactivity[];
            userteam: (userteam & {
                user: {
                    id: number;
                    firstName: string;
                    lastName: string;
                    email: string;
                    username: string;
                };
            })[];
        }
    ) => {
        const ProjectActivity = Project.projectactivity;

        function Compate(a: projectactivity, b: projectactivity) {
            if (a.parent < b.parent) {
                return -1;
            }

            if (a.parent > b.parent) {
                return 1;
            }

            return 0;
        }
    };

    async deleteProjectActivity(req: Request, res: Response) {
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

                await projectActivityService.UpdateParent(
                    iterator.projectActivityId,
                    joinSplitParent
                );
            }

            const success = await projectActivityService.deleteProjectActivity(
                req.body.idProjectActivity
            );

            let project = await projectService.GetOneRaw(
                req.body.id,
                req.body.idProject
            );
            if (!project) {
                project = await projectService.GetOneRawForUserTeam(
                    req.body.id,
                    req.body.idProject
                );
            }

            const cpm = new CPM(project, project.startDate);

            cpm.calculate();
            if (cpm.getDeadLine() !== 0) {
                const saveDeadLineProject = await projectDao.patchDeadline(
                    project.projectId,
                    cpm.getDeadLine(),
                    null,
                    cpm.getDate()
                );
                project.deadline = saveDeadLineProject.deadline;
                project.deadlineInString = saveDeadLineProject.deadlineInString;
            } else {
                project.deadline = null;
                project.deadlineInString = '0';
            }

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
            //
            return HttpResponse.Ok(res, activity);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };

    public SendEmailNotification = async (
        idUser: number,
        project: project,
        Progress: number,
        Context: ProjectActivityContext,
        Stats: StatsActivity
    ) => {
        // Jika Debug True Tidak Kirim Email

        if (process.env.DEBUG == 'true') {
            return;
        }
        const user = (await userService.readById(idUser, true, [
            'username',
            'email',
        ])) as RestApiGetUserById;

        const team = await userteamService.getTeamWithIdProject(
            project.projectId
        );

        const UserTeam = team.map((x) => x.user.email);

        const Contexts = ManipulateDataProjectActivityTemplateEmail(
            Stats,
            user.email,
            UserTeam.join(','),
            {
                ...Context,
                user: user.username,
                updatedAt: moment(project.updatedAt).format('LL'),
            },
            Progress
        );

        this.Email.setOptionEmail(Contexts);

        await this.Email.send(this.CallBackEmail);
    };

    public CallBackEmail = (
        err: Error,
        info: SMTPTransport.SentMessageInfo
    ) => {};
}

export default new ProjectACtivityController();
