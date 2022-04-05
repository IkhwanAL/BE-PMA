import { HttpResponse } from '../../common/services/http.service.config';
import { Request, Response } from 'express';
import 'dotenv/config';
import userService from '../../users/services/user.service';
import { EncryptService } from '../../common/services/encrypt.service.config';
import { EmailNodeMailer } from '../../common/email/email.config.service';
import moment from 'moment';
import userteamService from '../service/userteam.service';
import projectService from '../../project/service/project.service';

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
                from: saved.User.email,
                to: findEmail.email,
                subject: 'Invitation',
                template: 'invite',
                context: {
                    link: link,
                    expired: moment(saved.expiredAt).format('LLLL'),
                    username: findEmail.username,
                    invited: saved.User.username,
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
}

export default new UserTeamController();
