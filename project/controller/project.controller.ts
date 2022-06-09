import {
    project,
    projectactivity,
    subdetailprojectactivity,
    userteam,
} from '@prisma/client';
import { Request, Response } from 'express';
import moment from 'moment';
import { CreateActivityDto } from '../../activity/dto/create.activity.dto';
import activityService from '../../activity/service/activity.service';
import { ProjecType } from '../../common/@types/project.types';
import { CommonController } from '../../common/controller/controller.config';
import { CPM } from '../../common/cpm/calculate.cpm.config';
import { EmailNodeMailer } from '../../common/email/email.config.service';
import {
    ManipulationDataProjectTemplateEmail,
    ProjectContext,
    StatsActivity,
} from '../../common/email/email.template';
import { RestApiGetUserById } from '../../common/interfaces/api.interface';
import { HttpResponse } from '../../common/services/http.service.config';
import subProjectActivityDao from '../../subProjectActivity/daos/subProjectActivity.dao';
import userService from '../../users/services/user.service';
import userteamService from '../../userTeam/service/userteam.service';
import projectDao from '../daos/project.dao';
import { CreateProjectDto } from '../dto/create.project.dto';
import projectService from '../service/project.service';

class ProjectController extends CommonController {
    Email = new EmailNodeMailer();

    // Membuat Project Baru Dan Menyimpan Aktifitas Pengguna
    async createProject(req: Request, res: Response) {
        try {
            const payload = {
                projectName: req.body.projectName,
                projectDescription: req.body.projectDescription,
                startDate: req.body.startDate ?? new Date(),
            } as CreateProjectDto;

            const project = await projectService.create(req.body.id, payload);

            const PayloadActivity: CreateActivityDto = {
                activity: 'Membuat Baru',
                userId: req.body.id,
                projectId: project.projectId,
            };

            await activityService.createAsync(PayloadActivity);

            return HttpResponse.Ok(res, {
                projectId: project.projectId,
                projectName: project.projectName,
                projectDescription: project.projectDescription,
                startDate: project.startDate,
            });
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    // Menghapus Project Pada Database Secara Permanen
    public deleteProject = async (req: Request, res: Response) => {
        try {
            const { idProject } = req.params;

            if (!idProject) {
                return HttpResponse.BadRequest(res);
            }

            const findP = await projectService.getOneByIdProject(
                req.body.idProject
            );

            // const PayloadActivity: CreateActivityDto = {
            //     activity: 'Menghapus Data Project',
            //     userId: req.body.id,
            //     projectId: project.projectId,
            // };

            // await activityService.createAsync(PayloadActivity);

            await this.sendEmailNotification(
                req.body.id,
                findP,
                {
                    h2: 'Delete Proyek ' + findP.projectName,
                    p: 'Proyek Telah di Hapus',
                },
                StatsActivity.Delete
            );

            const project = await projectService.deleteProject(
                req.body.idProject
            );

            return HttpResponse.Ok(res, {});
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };

    // Mengambil Semua Project Pada User
    async getAllProject(req: Request, res: Response) {
        try {
            const project = await projectService.getAll(req.body.id);
            return HttpResponse.Ok(res, project);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async getRecent(req: Request, res: Response) {
        try {
            const project = await projectService.getRecentProject(req.body.id);

            return HttpResponse.Ok(res, project);
        } catch (error) {
            console.log(error);
            return HttpResponse.InternalServerError(res);
        }
    }

    // Mengambil Sebagian Kecil Project Dengan Id User
    async getOneSmallProject(req: Request, res: Response) {
        try {
            const project = await projectService.getOneSmallColumn(
                req.body.id,
                req.body.idProject
            );

            return HttpResponse.Ok(res, project);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    // Update Data Project dan Menyimpan Aktifitas User
    public patchProject = async (req: Request, res: Response) => {
        try {
            const allowedPatch = [
                'projectName',
                'projectDescription',
                'startDate',
            ];

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

            let FullDetailProject = await projectService.getOne(
                req.body.id,
                req.body.idProject
            );

            const cpm = new CPM(FullDetailProject, FullDetailProject.startDate);

            cpm.calculate();

            if (cpm.getDeadLine() !== 0) {
                const saveDeadLineProject = await projectDao.patchDeadline(
                    req.body.idProject,
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
                activity: 'Mengubah Data Project',
                userId: req.body.id,
                projectId: project.projectId,
            };

            await activityService.createAsync(PayloadActivity);
            await this.sendEmailNotification(
                req.body.id,
                project,
                {
                    h2: 'Update Proyek ' + project.projectName,
                    p: 'Proyek Telah di Update',
                },
                StatsActivity.Update
            );

            return HttpResponse.Created(res, {
                projectId: project.projectId,
                projectName: project.projectName,
                projectDescription: project.projectDescription,
            });
        } catch (error) {
            console.log(error.message);
            return HttpResponse.InternalServerError(res);
        }
    };

    // Mengambil Data Lengkap Pada Satu Project Dan Mengupdate Progress Project
    public getOneProject = async (req: Request, res: Response) => {
        try {
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

            // const NewProject = await this.calc(project, req.body.idProject);
            // const NewNewProject = await this.countProjectActivityProgress(
            //     NewProject,
            //     res
            // );

            return HttpResponse.Ok(res, project);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };

    // Menghitung Progress Aktifitas
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
                cpm.getDeadLine(),
                project.startDate
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

    private sendEmailNotification = async (
        idUser: number,
        project: project,
        Context: ProjectContext,
        Stats: StatsActivity
    ) => {
        const user = (await userService.readById(idUser, true, [
            'username',
            'email',
        ])) as RestApiGetUserById;
        const team = await userteamService.getTeamWithIdProject(
            project.projectId
        );

        const UserTeam = team.map((x) => x.user.email);

        const Contexts = ManipulationDataProjectTemplateEmail(
            Stats,
            user.email,
            UserTeam.join(','),
            {
                ...Context,
                user: user.username,
                updatedAt: moment(project.updatedAt).format('LL'),
            }
        );

        this.Email.setOptionEmail(Contexts);

        await this.Email.send();
        // }
    };
}

export default new ProjectController();
