import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DetalleAlquiler } from '../interfaces/detalle-alquiler.interface';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('send')
  @UseInterceptors(FilesInterceptor('files', 10))
  async sendEmail(
    @Body() emailData: { to: string; subject: string; text: string },
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
      const formattedAttachments = files.map((file) => ({
        filename: file.originalname,
        content: file.buffer,
      }));

      const detalleAlquiler: DetalleAlquiler = {
        abl: {
          impuestoInmobiliario: 0,
          totalAbl: 0,
        },
        expensas: {
          extraordinarias: 0,
          totalExpensas: 0,
        },
        alquiler: 300000,
      };

      await this.emailService.sendMail(
        emailData.to,
        emailData.subject,
        emailData.text,
        formattedAttachments,
        detalleAlquiler,
      );
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Email sent successfully' });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to send email', error });
    }
  }
}
