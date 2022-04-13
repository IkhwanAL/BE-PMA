// we import express to add types to the request/response objects from our controller functions
import express from 'express';

// we import our newly created user services
import { EmailNodeMailer } from '../../common/email/email.config.service';
import { EncryptService } from '../../common/services/encrypt.service.config';

// we import the argon2 library for password hashing
import argon2 from 'argon2';

// we use debug with a custom context as described in Part 1
import debug from 'debug';
import 'dotenv/config';

import { EncryptionTypes } from '../../common/@types/Encription.types';
import { SuccessType } from '../../common/@types/success.types';
import { FailedTypes } from '../../common/@types/failed.types';

import moment from 'moment';
import { HttpResponse } from '../../common/services/http.service.config';
import usersService from '../services/user.service';
import { JwtService } from '../../common/services/jwt.service.config';

const log: debug.IDebugger = debug('app:users-controller');

class UsersController {
    private readonly accessTokenExhaustedTime = 1 * 60 * 60;
    private readonly refreshTokenExhaustedTime = 5 * 60 * 60;

    async getUserById(req: express.Request, res: express.Response) {
        const user = await usersService.readById(parseInt(req.body.id));
        return res.status(200).send(user);
    }

    async createUser(req: express.Request, res: express.Response) {
        req.body.password = await argon2.hash(req.body.password);

        const crypt = new EncryptService();

        const encrypt = crypt.encrypt({ email: req.body.email }).toString();

        req.body.link = `http://${
            req.headers.host
        }/verify?q=${encodeURIComponent(encrypt)}`;
        const { id, email, username, link } = await usersService.create(
            req.body
        );

        const transporter = new EmailNodeMailer();

        transporter.setOptionEmail({
            from: 'ikhwanal235@gmail.com',
            to: email,
            subject: 'Verify Register User',
            template: 'register',
            context: {
                username: username,
                link: req.body.link,
                expired: moment(link[0].expiredAt).format('LLLL'),
            },
        });

        const { response } = await transporter.send();

        if (response.includes('OK')) {
            return res.status(201).send({ id: id });
        }

        return res.status(409).send({
            error: 'Something Wrong',
        });
    }

    async patchUser(req: express.Request, res: express.Response) {
        try {
            const allowedPatch = [
                'username',
                'firstName',
                'lastName',
                'phoneNumber',
            ];
            const { id, email, ...restOfBody } = req.body;

            for (const key in restOfBody) {
                const allow = allowedPatch.findIndex((x) => x === key);
                if (allow == -1) {
                    return HttpResponse.BadRequest(res);
                }
            }

            await usersService.patchById(id, restOfBody);

            return HttpResponse.Created(res, {});
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async refreshLink(req: express.Request, res: express.Response) {
        try {
            const crypt = new EncryptService();

            const encrypt = crypt.encrypt({ email: req.body.email }).toString();

            const link = `http://${
                req.headers.host
            }/verify?q=${encodeURIComponent(encrypt)}`;
            const Link = await usersService.createLink(req.body.id, link);

            if (!Link) {
                return HttpResponse.Confilct(res);
            }

            const transporter = new EmailNodeMailer();

            transporter.setOptionEmail({
                from: 'ikhwanal235@gmail.com',
                to: req.body.email,
                subject: 'Verify Register User',
                template: 'register',
                context: {
                    link: link,
                    expired: moment(Link.expiredAt).format('LLLL'),
                    username: Link.user.username,
                },
            });

            const { response } = await transporter.send();

            if (response.includes('OK')) {
                return HttpResponse.Ok(res, {});
            }
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async changePassword(req: express.Request, res: express.Response) {
        try {
            const password = await argon2.hash(req.body.password);

            await usersService.changePassword(req.body.id, password);

            return HttpResponse.NoContent(res);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    async removeUser(req: express.Request, res: express.Response) {
        try {
            await usersService.deleteById(req.body.id);

            return HttpResponse.NoContent(res);
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    }

    public login = async (req: express.Request, res: express.Response) => {
        const { password, ...rest } = await usersService.readByEmail(
            req.body.email,
            true
        );

        const verify = await argon2.verify(password, req.body.password);

        const token = new JwtService();

        const accessToken = token.encryptToken(
            { id: rest.id },
            this.accessTokenExhaustedTime
        );

        const refreshToken = token.encryptToken(
            { id: rest.id, email: rest.email },
            this.refreshTokenExhaustedTime
        );

        if (verify) {
            const now = new Date();
            now.setTime(now.getTime() + 5 * 3600 * 1000);

            res.cookie('asd', refreshToken, {
                expires: now,
                httpOnly: true,
            });

            if (!req.session['user']) {
                req.session['user'] = { id: rest.id, email: rest.email };
            }

            return res.status(200).send({
                sukses: true,
                message: 'Sukses Login',
                status: 200,
                data: { token: accessToken },
            } as SuccessType);
        } else {
            return res.status(401).send({
                error: 'User Or Password is Invalid Or User is Not Verifying',
                message: 'User Or Password Not Found',
                status: 401,
                sukses: false,
            } as FailedTypes);
        }
    };

    async verify(req: express.Request, res: express.Response) {
        const query = req.query;

        const crypt = new EncryptService();

        const decrypt = crypt.decrypt(
            decodeURIComponent(query.q.toString())
        ) as EncryptionTypes;

        const user = await usersService.readByEmail(decrypt.email);

        if (user) {
            const result = await usersService.activating(decrypt.email);

            if (result) {
                return res.status(200).send({
                    data: {},
                    message: 'Sukses Memverifikasi User',
                    sukses: true,
                    status: 200,
                } as SuccessType);
            }

            return res.status(500).send({
                message: 'Mohon Untuk Di Coba untuk beberapa saat',
                error: 'Verification',
                status: 500,
                sukses: false,
            } as FailedTypes);
        } else {
            return res.status(404).send({
                error: 'NotFound',
                message: `User Dengan Email ${decrypt.email} Tidak Ada`,
                status: 404,
                sukses: false,
            } as FailedTypes);
        }
    }

    async logout(req: express.Request, res: express.Response) {
        res.clearCookie('q');
        delete req.session['user'];

        return HttpResponse.NoContent(res);
    }

    public refreshToken = async (
        req: express.Request,
        res: express.Response
    ) => {
        delete req.session['user'];
        try {
            const { id, email } = req.body;

            const token = new JwtService();

            const accessToken = token.encryptToken(
                { id: id },
                this.accessTokenExhaustedTime
            );

            const refreshToken = token.encryptToken(
                { id: id, email: email },
                this.refreshTokenExhaustedTime
            );

            const now = new Date();

            now.setTime(now.getTime() + 5 * 3600 * 1000);

            res.cookie('asd', refreshToken, {
                httpOnly: true,
                expires: now,
            });
            if (!req.session['user']) {
                req.session['user'] = { id: id, email: email };
            }

            return HttpResponse.Ok(res, { token: accessToken });
        } catch (error) {
            return HttpResponse.InternalServerError(res);
        }
    };
}

export default new UsersController();
