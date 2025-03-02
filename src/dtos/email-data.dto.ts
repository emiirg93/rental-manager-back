import { DetalleAlquiler } from '../interfaces/detalle-alquiler.interface';

export class EmailDataDto {
  to: string;
  subject: string;
  text: string;
  detalleAlquiler: DetalleAlquiler;
}
