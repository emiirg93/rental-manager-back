import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { tamplateHTML } from '../helpers/utils';
import { DetalleAlquiler } from '../interfaces/detalle-alquiler.interface';

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
        user: 'emiliano.rg93@gmail.com', // Reemplaza con tu correo electrónico
        pass: 'cwlp jazg wyom bwcu', // Reemplaza con tu contraseña
      },
    });
  }

  // Método para enviar correos electrónicos
  async sendMail(
    to: string,
    subject: string,
    text: string,
    attachments: { filename: string; content: Buffer }[],
    detalleAlquiler: DetalleAlquiler,
  ) {
    const mailOptions = {
      from: '"Emiliano Rago" <emiliano.rg93@gmail.com>', // Reemplaza con tu correo electrónico
      to,
      subject,
      text,
      attachments,
      html: tamplateHTML(detalleAlquiler),
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
