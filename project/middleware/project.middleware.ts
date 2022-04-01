import { NextFunction, Request, Response } from 'express';
import { Http } from 'winston/lib/winston/transports';
import { HttpResponse } from '../../common/services/http.service.config';
import { CommonMiddleware } from '../../common/middleware/common.middleware.config';
import projectDao from '../daos/project.dao';

class ProjectMiddleware extends CommonMiddleware {}

export default new ProjectMiddleware();
