import {
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadFileService } from './upload-file.service';

@Controller('upload-file')
export class UploadFileController {
  constructor(private uploadFileSvc: UploadFileService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10)) // 'file' debe coincidir con el campo del formulario.
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    const response = await this.uploadFileSvc.precessFile(files);

    return res.status(HttpStatus.OK).json({
      response,
    });
  }
}
