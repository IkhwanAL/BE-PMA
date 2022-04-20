import express from 'express';
import expressSession, { Session } from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import MysqlPrisma from './common/services/mysql.service.config';
import * as http from 'http';
import cluster from 'cluster';
import os from 'os';
import cookieParser from 'cookie-parser';

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

const debugLog: debug.IDebugger = debug('app');

declare module 'express-session' {
    interface Session {
        user: SessionUser;
    }
}

const totalCpus = os.cpus().length;

// if (cluster.isPrimary) {
//     console.log(`Number of CPUs is ${totalCpus}`);
//     console.log(`Master ${process.pid} is running`);

//     for (let index = 0; index < totalCpus; index++) {
//         cluster.fork();
//     }

//     cluster.on('exit', (worker, code, signal) => {
//         console.log(`worker ${worker.process.pid} died`);
//         console.log("Let's fork another worker!");
//         cluster.fork();
//     });
// } else {
const app = express();
console.log(`Worker ${process.pid} started`);
app.disable('x-powered-by');
const port = 3001;

const Routes: Array<CommonRoutesConfig> = [];

app.use(cookieParser());

app.use(express.json());

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

const loggerOptions: expressWinston.LoggerOptions = {
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.colorize({ all: true })
    ),
};

if (!process.env.DEBUG) {
    loggerOptions.meta = false;
}

app.use(expressWinston.logger(loggerOptions));

Routes.push(new UserRoutes(app));
Routes.push(new ProjectRoute(app));
Routes.push(new UserTeamRoutes(app));
Routes.push(new ProjectActivityRoute(app));
Routes.push(new SubProjectActivityRoute(app));

const runningMessage = `Server running at http://localhost:${port}`;

app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(runningMessage);
});

app.listen(port, () => {
    debugLog(`Server running at http://localhost:${port}`);
    Routes.forEach((route: CommonRoutesConfig) => {
        route.configureRoutes();

        debugLog(`Routes configured for ${route.getName()}`);
    });

    console.log(runningMessage);
});
// }
