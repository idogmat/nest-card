import { INestApplication } from '@nestjs/common';
import nodemailer from "nodemailer";

export class EmailTestManager {
  constructor(protected readonly app: INestApplication) {
  }

  async transporter() {
    return nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PWD,
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