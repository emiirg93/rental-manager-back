import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('send')
  async sendEmail(
    @Body() emailData: { to: string; subject: string; text: string },
    @Res() res: Response,
  ) {
    try {
      await this.emailService.sendMail(
        emailData.to,
        emailData.subject,
        emailData.text,
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
