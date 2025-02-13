import * as pdf from 'pdf-parse';

const preprocessText = (text: string): string => {
  // Realiza ajustes en el texto para mantener el formato
  // Por ejemplo, puedes reemplazar múltiples espacios por un solo espacio
  return text.replace(/\s+/g, ' ').trim();
};

const extractAmount = (text: string, keyword: string): number => {
  const lines = text.split('\n');
  let foundKeyword = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(keyword)) {
      foundKeyword = true;
    }

    if (foundKeyword) {
      const match = lines[i].match(/\$([\d.,]+)/);
      if (match) {
        return Number(match[1].replace(/\./g, '').replace(',', '.'));
      }
    }
  }

  throw new Error(`No se encontró el monto para ${keyword} en el PDF.`);
};

export const getImpuestoInmobiliario = async (f) => {
  // Leer el contenido del PDF
  const pdfData = await pdf(f.buffer);

  // Obtener todo el texto
  let text = pdfData.text;

  // Preprocesar el texto
  text = preprocessText(text);

  console.log(text);

  // Buscar el monto del Impuesto Inmobiliario
  return extractAmount(text, 'IMPUESTO INMOBILIARIO:');
};

export const getExpensasExtraordinarias = async (f) => {
  // Leer el contenido del PDF
  const pdfData = await pdf(f.buffer);

  // Obtener todo el texto
  let text = pdfData.text;

  // Preprocesar el texto
  text = preprocessText(text);

  console.log(text);

  // Buscar el monto de Expensas Extraordinarias
  return extractAmount(text, 'Exp. Extraord.');
};
