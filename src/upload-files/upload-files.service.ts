import { Injectable } from '@nestjs/common';
import {
  extractExpExtraord,
  extractImpuestoInmobiliario,
  extractSaldoAPagarABL,
  extractTotalExpensas,
  extraerTextoOrdenado,
} from '../helpers/utils';
import { DetalleAlquiler } from '../interfaces/detalle-alquiler.interface';

@Injectable()
export class UploadFileService {
  async precessFile(files: Express.Multer.File[]) {
    const res: DetalleAlquiler = {
      abl: {
        impuestoInmobiliario: 0,
        totalAbl: 0,
      },
      expensas: {
        extraordinarias: 0,
        totalExpensas: 0,
      },
      alquiler: 317000,
    };
    console.log('files', files.length);
    for (const [i, f] of files.entries()) {
      const texto = await extraerTextoOrdenado(f);
      if (i === 0) {
        res.abl.impuestoInmobiliario = extractImpuestoInmobiliario(texto);
        res.abl.totalAbl = extractSaldoAPagarABL(texto);
      } else {
        res.expensas.extraordinarias = extractExpExtraord(texto);
        res.expensas.totalExpensas = extractTotalExpensas(texto);
      }
    }

    res.alquiler -= res.abl.impuestoInmobiliario - res.expensas.extraordinarias;

    return res;
  }
}
