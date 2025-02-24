import { Module } from '@nestjs/common';
import { EmailController } from './email/email.controller';
import { EmailService } from './email/email.service';
import { UploadFilesController } from './upload-files/upload-files.controller';
import { UploadFileService } from './upload-files/upload-files.service';

@Module({
  imports: [],
  controllers: [UploadFilesController, EmailController],
  providers: [UploadFileService, EmailService],
})
export class AppModule {}
