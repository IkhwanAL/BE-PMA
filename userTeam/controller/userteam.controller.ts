import { HttpResponse } from '../../common/services/http.service.config';
import { Request, Response } from 'express';
import 'dotenv/config';
import userService from '../../users/services/user.service';
import { EncryptService } from '../../common/services/encrypt.service.config';
import { EmailNodeMailer } from '../../common/email/email.config.service';
import moment from 'moment';
import userteamService from '../service/userteam.service';

export class UserTeamController {
    async invite(req: Request, res: Response) {
        try {
            const findEmail = await userService.readById(
                req.body.idUserInvitation
            );

            if (!findEmail) {
                return HttpResponse.BadRequest(res);
            }

            const crypt = new EncryptService();

            const encrypt = crypt
                .encrypt({ id: findEmail.id, email: findEmail.email })
                .toString();

            const link = `http://${
                process.env.IPWEB
            }/login?q=${encodeURIComponent(encrypt)}`;

            const saved = await userService.createLink(req.body.id, link);

            const transport = new EmailNodeMailer();

            transport.setOptionEmail({
                from: saved.User.email,
                to: findEmail.email,
                subject: 'Invitation',
                template: 'register',
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

    async deleteUserFromTeam(req: Request, res: Response) {
        try {
            await userteamService.deleteuserTeam(
                req.body.idProject,
                req.body.idUserInv
            );

            return HttpResponse.NoContent(res);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }
}
