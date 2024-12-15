import { Module } from '@nestjs/common';
import { UploadFileController } from './upload-file/upload-file.controller';
import { UploadFileService } from './upload-file/upload-file.service';

@Module({
  imports: [],
  controllers: [UploadFileController],
  providers: [UploadFileService],
})
export class AppModule {}
