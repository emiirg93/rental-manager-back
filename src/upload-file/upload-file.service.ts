import { Injectable } from '@nestjs/common';
import {
  extractExpExtraord,
  extractImpuestoInmobiliario,
  extraerTextoOrdenado,
} from '../helpers/utils';

@Injectable()
export class UploadFileService {
  async precessFile(files: Express.Multer.File[]) {
    const res = { inmobiliario: 0, extraordinarias: 0, alquiler: 317000 };

    for (const [i, f] of files.entries()) {
      const texto = await extraerTextoOrdenado(f);
      if (i === 0) {
        res.inmobiliario = extractImpuestoInmobiliario(texto);
      } else {
        res.extraordinarias = extractExpExtraord(texto);
      }
    }

    res.alquiler -= res.inmobiliario - res.extraordinarias;

    return res;
  }
}
