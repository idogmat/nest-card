import nodemailer from "nodemailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
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

  async sendMail(_name: string, mail: string, code: string) {
    const transporter = await this.transporter();
    const url = process.env.CONFIRM_EMAIL + code;
    transporter.sendMail({
      from: "Jack", // sender address
      to: mail, // list of receivers
      subject: "Authorization", // Subject line
      html: `
      <h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
          <a href=${url}>complete registration</a>
        </p>
      `,
    });
  }

  async sendMailPasswordRecovery(
    _name: string,
    mail: string,
    code: string,
  ) {
    const transporter = await this.transporter();
    const url = process.env.RECOVERY_EMAIL + code;
    transporter.sendMail({
      from: "Jack", // sender address
      to: mail, // list of receivers
      subject: "Password recovery", // Subject line
      html: `
      <h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
          <a href='${url}'>recovery password</a>
        </p>
      `,
    });
  }
}
