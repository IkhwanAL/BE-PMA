// we import express to add types to the request/response objects from our controller functions
import express from 'express';

// we import our newly created user services
import usersService from '../services/user.service';
import { EmailNodeMailer } from '../../common/email/email.config.service';

// we import the argon2 library for password hashing
import argon2 from 'argon2';
import CryptoJS from 'crypto-js';

// we use debug with a custom context as described in Part 1
import debug from 'debug';
import 'dotenv/config';
import { EncryptionTypes } from '../../common/types/Encription.types';
import userService from '../services/user.service';

const log: debug.IDebugger = debug('app:users-controller');

class UsersController {
    async getUserById(req: express.Request, res: express.Response) {
        const user = await usersService.readById(parseInt(req.body.id));
        res.status(200).send(user);
    }

    async createUser(req: express.Request, res: express.Response) {
        req.body.password = await argon2.hash(req.body.password);
        const encrypt = CryptoJS.AES.encrypt(
            JSON.stringify({ email: req.body.email }),
            process.env.SECRET_KEY
        );

        req.body.link = `http://${req.headers.host}/verify?q=${encrypt}`;
        const { id, email, username } = await usersService.create(req.body);

        const transporter = new EmailNodeMailer();

        transporter.setOptionEmail({
            from: 'ikhwanal235@gmail.com',
            to: email,
            subject: 'Verify Register User',
            template: 'register',
            context: {
                username: username,
                link: req.body.link,
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

    async refreshLink(req: express.Request, res: express.Response) {}

    // async patch(req: express.Request, res: express.Response) {
    //     if (req.body.password) {
    //         req.body.password = await argon2.hash(req.body.password);
    //     }
    //     log(await usersService.patchById(req.body.id, req.body));
    //     res.status(204).send();
    // }

    //     async put(req: express.Request, res: express.Response) {
    //         req.body.password = await argon2.hash(req.body.password);
    //         log(await usersService.putById(req.body.id, req.body));
    //         res.status(204).send();
    //     }

    //     async removeUser(req: express.Request, res: express.Response) {
    //         log(await usersService.deleteById(req.body.id));
    //         res.status(204).send();
    //     }

    async login(req: express.Request, res: express.Response) {
        const { password } = await usersService.readByEmail(req.body.email);

        const verify = await argon2.verify(password, req.body.password);

        if (verify) {
            res.status(200).send();
        } else {
            res.status(401).send({
                error: 'User Or Password Did not Exists',
            });
        }
    }

    async verify(req: express.Request, res: express.Response) {
        const { q } = req.query;

        const { email } = JSON.parse(
            CryptoJS.AES.decrypt(q.toString(), process.env.SECRET_KEY).toString(
                CryptoJS.enc.Utf8
            )
        ) as EncryptionTypes;

        const user = await userService.readByEmail(email);

        if (user) {
        }
    }
}

export default new UsersController();
