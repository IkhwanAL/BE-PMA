import { HttpResponse } from '../../common/services/http.service.config';
import { Request, Response } from 'express';
import 'dotenv/config';
import userService from '../../users/services/user.service';
import { EncryptService } from '../../common/services/encrypt.service.config';
import { EmailNodeMailer } from '../../common/email/email.config.service';
import moment from 'moment';
import userteamService from '../service/userteam.service';
import projectService from '../../project/service/project.service';
import userteamDao from '../daos/userteam.dao';
import usersDao from '../../users/daos/users.dao';
import projectDao from '../../project/daos/project.dao';

class UserTeamController {
    /**
     * Needs
     * - IdUserInvintation
     * - idUser
     * - idProject
     * @param req
     * @param res
     * @returns
     */
    async invite(req: Request, res: Response) {
        try {
            const findEmail = await userService.readById(
                req.body.idUserInvitation
            );

            if (!findEmail) {
                return HttpResponse.BadRequest(res);
            }

            const inviterEmail = await userService.readById(req.body.id);
            const inviterProject = await projectService.getOneByIdProject(
                req.body.idProject
            );

            const crypt = new EncryptService();

            const encrypt = crypt
                .encrypt({
                    inviter: {
                        id: inviterEmail.id,
                        email: inviterEmail.email,
                        project: inviterProject.projectName,
                        idProject: inviterProject.projectId,
                    },
                    userBeenInvited: {
                        id: findEmail.id,
                        email: findEmail.email,
                    },
                })
                .toString();

            const link = `${process.env.IPWEB}?q=${encodeURIComponent(
                encrypt
            )}&l=verfiy`;

            const saved = await userService.createLink(req.body.id, link);

            const transport = new EmailNodeMailer();

            transport.setOptionEmail({
                from: saved.user.email,
                to: findEmail.email,
                subject: 'Invitation',
                template: 'invite',
                context: {
                    link: link,
                    expired: moment(saved.expiredAt).format('LLLL'),
                    username: findEmail.username,
                    invited: saved.user.username,
                },
            });

            const { response } = await transport.send();

            if (response) {
                return HttpResponse.Created(res, {});
            }

            return HttpResponse.ServiceUnavailable(res);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }
    /**
     * Needs
     * - idProject
     * - idUserInvintation
     * @param req
     * @param res
     * @returns
     */
    async deleteUserFromTeam(req: Request, res: Response) {
        try {
            await userteamService.deleteuserTeam(
                req.body.idProject,
                req.body.idUserInvitation
            );

            return HttpResponse.NoContent(res);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    /**
     * Needs
     * - idProject
     * - idUserInvitation
     * @param req
     * @param res
     * @returns
     */
    async accept(req: Request, res: Response) {
        try {
            await userteamService.addUserTeam(req.body.idProject, req.body.id);

            return HttpResponse.Created(res, {});
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async changeOwner(req: Request, res: Response) {
        try {
            const { id, idUserInvitation, idProject } = req.body;

            const crypt = new EncryptService();

            const encryptIdProject = encodeURIComponent(
                crypt.encrypt(idProject).toString()
            );
            const encryptIdUserInv = encodeURIComponent(
                crypt.encrypt(id).toString()
            );

            const trasporter = new EmailNodeMailer();
            const emailReceiver = await usersDao.getUsersById(idUserInvitation);
            const getProject = await projectDao.readOne(idProject);
            const getOwner = await usersDao.getUsersById(id);

            const link = `http://${req.headers.host}/changeowner/${encryptIdProject}/${encryptIdUserInv}`;

            const Link = await userService.createLink(id, link);

            trasporter.setOptionEmail({
                from: 'ikhwanal235@gmail.com',
                to: emailReceiver.email,
                subject: `Selected As Proyek Manager For ${getProject.projectName} Project`,
                template: 'changeowner',
                context: {
                    owner: getOwner.username,
                    link: Link.description,
                    choosen: emailReceiver.username,
                },
            });

            const { response } = await trasporter.send();

            if (response.includes('OK')) {
                return HttpResponse.Ok(res, {});
            }

            return HttpResponse.BadRequest(res);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    public ownerChange = async (req: Request, res: Response) => {
        try {
            /**
             * Id => Id Login User
             * idProject => Id Project That Want To Change Leader
             * idLeaderParam => Id Leader Of Project
             */
            const { id, idProject, idLeaderParam } = req.body;

            const idLeader = decodeURIComponent(idLeaderParam);
            const idPro = decodeURIComponent(idProject);

            await userteamDao.changePM(parseInt(idLeader), id, parseInt(idPro));

            return HttpResponse.Ok(res, {});
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };

    public deleteTeam = async (req: Request, res: Response) => {
        try {
            const { idTeam } = req.body;

            await userteamService.deleteTeam(idTeam);

            return HttpResponse.NoContent(res);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };
}

export default new UserTeamController();
