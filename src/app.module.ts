import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailController } from './email/email.controller';
import { EmailService } from './email/email.service';
import { UploadFilesController } from './upload-files/upload-files.controller';
import { UploadFileService } from './upload-files/upload-files.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [UploadFilesController, EmailController],
  providers: [UploadFileService, EmailService],
})
export class AppModule {}
