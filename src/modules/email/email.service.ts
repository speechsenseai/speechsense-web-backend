import { Injectable } from '@nestjs/common';
import * as Mail from 'nodemailer/lib/mailer';
import { createTransport } from 'nodemailer';
import * as fs from 'fs';
import 'dotenv/config';

@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;

  constructor() {
    this.nodemailerTransport = createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  sendVerificationEmail(body: { email: string; url: string }) {
    const html = this.parseHtmlTemplate(
      'src/assets/emailVerification.html',
      body,
    );
    return this.nodemailerTransport.sendMail({
      from: `Speechsense AI Notification <${process.env.EMAIL_USER}>`,
      to: body.email,
      subject: 'Verify your email',
      html,
    });
  }
  sendResetPasswordEmail(body: {
    email: string;
    url: string;
    name: string | null;
  }) {
    const html = this.parseHtmlTemplate('src/assets/resetPassword.html', {
      ...body,
      name: body.name || body.email,
    });
    return this.nodemailerTransport.sendMail({
      from: `Speechsense AI Notification <${process.env.EMAIL_USER}>`,
      to: body.email,
      subject: 'Reset your password',
      html,
    });
  }
  parseHtmlTemplate(path: string, values: Record<string, string>) {
    const templateContent = fs.readFileSync(path, 'utf8');
    const renderedHtml = templateContent.replace(
      /{{\s*(\w+)\s*}}/g,
      (match, p1) => {
        return values[p1] || match;
      },
    );

    return renderedHtml;
  }
}
