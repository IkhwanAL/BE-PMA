import express from 'express';
import expressSession from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import MysqlPrisma from './common/services/mysql.service.config';
import * as http from 'http';

import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import { CommonRoutesConfig } from './common/common.route.config';
import { UserRoutes } from './users/users.route.config';
import debug from 'debug';

const app = express();

const server = http.createServer(app);

const port = 3001;

const Routes: Array<CommonRoutesConfig> = [];

const debugLog: debug.IDebugger = debug('app');

app.use(express.json());

app.use(cors());

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

app.use(
    expressSession({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // ms
        },
        secret: 'S3C43T_G3N50KYU',
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(MysqlPrisma, {
            checkPeriod: 2 * 60 * 1000, //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }),
    })
);

Routes.push(new UserRoutes(app));

const runningMessage = `Server running at http://localhost:${port}`;

app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(runningMessage);
});

server.listen(port, () => {
    debugLog(`Server running at http://localhost:${port}`);
    Routes.forEach((route: CommonRoutesConfig) => {
        route.configureRoutes();
        debugLog(`Routes configured for ${route.getName()}`);
    });

    console.log(runningMessage);
});

// app.get('*', (req: express.Request, res: express.Response) => {
//     res.status(404).send('Link Api Not Found');
// });
