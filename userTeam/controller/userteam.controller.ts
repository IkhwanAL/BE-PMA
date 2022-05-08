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
import { RestApiGetUserById } from '../../common/interfaces/api.interface';

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
            const findEmail = (await userService.readById(
                req.body.idUserInvitation
            )) as RestApiGetUserById;

            if (!findEmail) {
                return HttpResponse.BadRequest(res);
            }

            const inviterEmail = (await userService.readById(
                req.body.id
            )) as RestApiGetUserById;
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

            if (response.includes('OK')) {
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
            console.log(req.body);
            const { id, idUserInvitation, idProject } = req.body;

            const crypt = new EncryptService();

            // Encrypt Project
            const encryptIdProject = encodeURIComponent(
                crypt.encrypt(idProject).toString()
            );

            // Encrypt Login
            const encryptIdUserInv = encodeURIComponent(
                crypt.encrypt(id).toString()
            );

            const trasporter = new EmailNodeMailer();

            // Encrypt User Blah Blah Blah
            const emailReceiver = (await usersDao.getUsersById(
                idUserInvitation,
                true,
                ['email', 'id']
            )) as RestApiGetUserById;

            const getProject = await projectDao.readOne(idProject);
            const getOwner = (await usersDao.getUsersById(
                id
            )) as RestApiGetUserById;

            const param = encodeURIComponent(
                crypt
                    .encrypt(`${encryptIdProject}+${emailReceiver.id}`)
                    .toString()
            );

            // const link = `http://${req.headers.host}/ownerchange/${encryptIdProject}/${encryptIdUserInv}`;

            const link = `http://${req.headers.host}/ownerchange/${param}`;

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
            console.log(error);
            return HttpResponse.InternalServerError(res);
        }
    }

    public ownerChange = async (req: Request, res: Response) => {
        try {
            console.log(req.body, 'Body');
            /**
             * idProject => Id Project That Want To Change Leader
             * idLeaderParam => Id Leader Of Project
             */
            const { idProject, idLeaderParam } = req.body;

            await userteamService.changeOwner(idLeaderParam, idProject);
            const link = `${process.env.IPWEB}?Url=ChangeOwner&_q=true`;
            return HttpResponse.RedirectPermanent(res, link);
        } catch (error) {
            console.log(error, 'Fetch');
            return HttpResponse.InternalServerError(res);
        }
    };

    public deleteTeam = async (req: Request, res: Response) => {
        try {
            const { Data } = req.body;

            for (const iterator of Data as Array<number>) {
                
            }

            await userteamService.deleteTeam(Data as Array<number>);

            return HttpResponse.NoContent(res);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };
}

export default new UserTeamController();
