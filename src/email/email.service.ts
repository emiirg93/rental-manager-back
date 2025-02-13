import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    // Configuración del transportador de nodemailer
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Reemplaza con tu servidor SMTP
      port: 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: 'emilianomrago@gmail.com', // Reemplaza con tu correo electrónico
        pass: 'dmfj ijgh yumk reog', // Reemplaza con tu contraseña
      },
    });
  }

  // Método para enviar correos electrónicos
  async sendMail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: '"Emiliano Rago" <emilianomrago@gmail.com>', // Reemplaza con tu correo electrónico
      to,
      subject,
      text,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Mensaje enviado: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error al enviar el correo: %s', error);
      throw error;
    }
  }
}
