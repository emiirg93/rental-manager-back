import * as pdf from 'pdf-parse';

export const getImpuestoInmobiliario = async (f) => {
  // Leer el contenido del PDF
  const pdfData = await pdf(f.buffer);

  // Obtener todo el texto
  const text = pdfData.text;

  const regexLine = /\$[\d.,]+\s*[\d.,]+[\s\S]*?\$([\d.,]+)\$([\d.,]+)/;
  const match = text.match(regexLine);

  if (match) {
    // Reemplaza el separador de miles y convierte la coma a punto
    return Number(match[1].replace(/\./g, '').replace(',', '.')); // Retorna el monto (e.g., "5.086,19")
  }

  throw new Error(
    'No se encontró el monto del Impuesto Inmobiliario en el PDF.',
  );
};

export const getExpensasExtraordinarias = async (f) => {
  // Leer el contenido del PDF
  const pdfData = await pdf(f.buffer);

  // Obtener todo el texto
  const text = pdfData.text;
  const regexLine = /exp\. extraord\.\s*\$\s*([\d.,]+)/i;
  const match = text.match(regexLine);

  if (match) {
    return Number(match[1].replace(/\./g, '').replace(',', '.')); // Retorna el monto (e.g., "19.080,00")
  }

  throw new Error(
    'No se encontró el monto de las Expensas Extraordinarias en el PDF.',
  );
};
