import { Injectable } from '@nestjs/common';
import {
  getExpensasExtraordinarias,
  getImpuestoInmobiliario,
} from '../helpers/utils';

@Injectable()
export class UploadFileService {
  async precessFile(files: Express.Multer.File[]) {
    const res = {
      inmobiliario: 0,
      extraordinarias: 0,
      alquiler: 317000,
    };

    for (const [i, f] of files.entries()) {
      if (i === 0) {
        res.inmobiliario = await getImpuestoInmobiliario(f);
      } else {
        res.extraordinarias = await getExpensasExtraordinarias(f);
      }
    }

    res.alquiler -= res.inmobiliario - res.extraordinarias;

    return res;
  }
}
