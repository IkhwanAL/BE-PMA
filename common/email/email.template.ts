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
