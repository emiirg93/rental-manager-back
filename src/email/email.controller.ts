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
import { EmailDataDto } from '../dtos/email-data.dto';
import { DetalleAlquiler } from '../interfaces/detalle-alquiler.interface';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('send')
  @UseInterceptors(FilesInterceptor('files', 10))
  async sendEmail(
    @Body() emailData: EmailDataDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
      const formattedAttachments = files.map((file) => ({
        filename: file.originalname,
        content: file.buffer,
      }));

      const detalle = JSON.parse(emailData.detalleAlquiler) as DetalleAlquiler;

      await this.emailService.sendMail(
        emailData.to,
        emailData.subject,
        emailData.text,
        formattedAttachments,
        { ...detalle, comentario: emailData.text },
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
