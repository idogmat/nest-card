import { INestApplication } from '@nestjs/common';
import nodemailer from "nodemailer";

export class EmailTestManager {
  constructor(protected readonly app: INestApplication) {
  }

  async transporter() {
    return nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.EMAIL_PWD, // generated ethereal password
      },
    });
  }

  async sendMail(_name: string, _mail: string, _code: string) {
    return Promise.resolve();
  }

  async sendMailPasswordRecovery(
    _name: string,
    _mail: string,
    _code: string,
  ) {
    return Promise.resolve();
  }
}