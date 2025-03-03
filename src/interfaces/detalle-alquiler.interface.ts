export interface DetalleAlquiler {
  abl: {
    impuestoInmobiliario: number;
    totalAbl: number;
  };
  expensas: {
    extraordinarias: number;
    totalExpensas: number;
  };
  alquiler: number;
  comentario?: string;
}
