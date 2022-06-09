import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import path from 'path';
import 'dotenv/config';

export class EmailNodeMailer {
    private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
    private handlerOptions: hbs.NodemailerExpressHandlebarsOptions;
    private setOptions: nodemailer.SendMailOptions;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER,
                pass: process.env.APP_GMAIL_PASSWORD,
            },
            // host: 'smtp.gmail.com',
        });

        this.handlerOptions = {
            viewEngine: {
                partialsDir: path.resolve('./common/handlebars/email/'),
                defaultLayout: false,
            },
            viewPath: path.resolve('./common/handlebars/email/'),
        };

        this.transporter.use('compile', hbs(this.handlerOptions));
    }

    public setOptionEmail(
        options: nodemailer.SendMailOptions & hbs.TemplateOptions
    ): void {
        this.setOptions = options;
    }

    public async send(
        Callback = (_err: Error, _info: SMTPTransport.SentMessageInfo) => {}
    ) {
        return this.transporter.sendMail(this.setOptions, Callback);
    }
}
