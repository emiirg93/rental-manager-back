import { Module } from '@nestjs/common';
import { UploadFileController } from './upload-file/upload-file.controller';
import { UploadFileService } from './upload-file/upload-file.service';
import { EmailController } from './email/email.controller';
import { EmailService } from './email/email.service';

@Module({
  imports: [],
  controllers: [UploadFileController, EmailController],
  providers: [UploadFileService, EmailService],
})
export class AppModule {}
