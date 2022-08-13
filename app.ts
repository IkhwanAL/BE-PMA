import express from 'express';
import cluster from 'cluster';
import os from 'os';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import { CommonRoutesConfig } from './common/common.route.config';
import { UserRoutes } from './users/users.route.config';
import debug from 'debug';
import { ProjectRoute } from './project/project.route.config';
import { UserTeamRoutes } from './userTeam/userTeam.route.config';
import { ProjectActivityRoute } from './projectActivity/projectActivity.route.config';
import { SubProjectActivityRoute } from './subProjectActivity/subProjectActivity.route.config';
import { SessionUser } from './common/interfaces/session.interface';
import { ActivityRoute } from './activity/activity.route.config';

const debugLog: debug.IDebugger = debug('app');

// declare module 'express-session' {
//     interface Session {
//         user: SessionUser;
//     }
// }

const totalCpus = os.cpus().length;

// if (cluster.isPrimary) {
//     if (totalCpus > 1) {
//         for (let index = 0; index < totalCpus / 2; index++) {
//             cluster.fork();
//         }
//     } else {
//         cluster.fork();
//     }

//     cluster.on('exit', (worker, code, signal) => {
//         cluster.fork();
//     });
// } else {
const app = express();
app.disable('x-powered-by');
const port = process.env.PORT || 3001;

const Routes: Array<CommonRoutesConfig> = [];

app.use(cookieParser());

app.use(express.json());

// Cors
app.use(
    cors({
        credentials: true,
        origin: 'https://project-management-topaz.vercel.app',
    })
);

// app.use(
//     cors({
//         credentials: true,
//         origin: 'http://localhost:3000',
//     })
// );

const loggerOptions: expressWinston.LoggerOptions = {
    transports: [
        // new winston.transports.Console(),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
    meta: true,
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.colorize({ all: true, message: true, level: true })
    ),
};

// if (!process.env.DEBUG) {
//     loggerOptions.meta = false;
// }

app.use(expressWinston.logger(loggerOptions));

Routes.push(new UserRoutes(app));
Routes.push(new ProjectRoute(app));
Routes.push(new UserTeamRoutes(app));
Routes.push(new ProjectActivityRoute(app));
Routes.push(new SubProjectActivityRoute(app));
Routes.push(new ActivityRoute(app));

const runningMessage = `Server running at http://localhost:${port}`;

app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(runningMessage);
});

app.listen(process.env.PORT || 3001, () => {
    console.log(runningMessage);
    Routes.forEach((route: CommonRoutesConfig) => {
        route.configureRoutes();

        debugLog(`Routes configured for ${route.getName()}`);
    });
});
// }
