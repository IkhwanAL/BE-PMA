import hbs from 'nodemailer-express-handlebars';
import nodemailer from 'nodemailer';

export enum StatsActivity {
    Create = 'Create',
    Update = 'Update',
    Delete = 'Delete',
}

interface MainContext {
    h2: string;
    p: string;
}

export interface ProjectContext extends MainContext {
    user?: string;
    updatedAt?: string | Date;
}

export interface ProjectActivityContext extends ProjectContext {}

export const ManipulationDataProjectTemplateEmail = (
    Stats: StatsActivity,
    from: string,
    to: string | Array<string>,
    context: ProjectContext
): nodemailer.SendMailOptions & hbs.TemplateOptions => {
    return {
        from: from,
        to: to,
        context: context,
        subject: `${Stats} Data Project`,
        template: 'project',
    };
};

export const ManipulateDataProjectActivityTemplateEmail = (
    Stats: StatsActivity,
    from: string,
    to: string | Array<string>,
    context: ProjectActivityContext,
    Progress: number
): nodemailer.SendMailOptions & hbs.TemplateOptions => {
    if (Progress >= 100) {
        return {
            from: from,
            to: to,
            context: context,
            subject: `Data Project Activity Progress 100%`,
            template: 'project',
        };
    }
    return {
        from: from,
        to: to,
        context: context,
        subject: `${Stats} Data Project Activity`,
        template: 'project',
    };
};
