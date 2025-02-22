import * as pdfjsLib from 'pdfjs-dist';

export const extraerTextoOrdenado = async (
  file: Express.Multer.File,
): Promise<string> => {
  const data = new Uint8Array(file.buffer);
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let textoCompleto = '';

  for (let numeroPagina = 1; numeroPagina <= pdf.numPages; numeroPagina++) {
    const pagina = await pdf.getPage(numeroPagina);
    const contenido = await pagina.getTextContent();
    const items = contenido.items as any[];

    // Ordenar los items basándose en su posición vertical y horizontal.
    // Se asume que un mayor valor en transform[5] indica una posición más alta en la página.
    items.sort((a, b) => {
      // Si están aproximadamente en la misma línea (margen de error en Y), ordena por X.
      if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
        return a.transform[4] - b.transform[4];
      }
      // Orden descendente por Y (de arriba hacia abajo)
      return b.transform[5] - a.transform[5];
    });

    const textoPagina = items.map((item) => item.str).join(' ');
    textoCompleto += textoPagina + '\n';
  }

  return textoCompleto;
};

/**
 * Reconstruye el texto eliminando los espacios intermedios entre caracteres alfanuméricos o símbolos,
 * incluyendo letras Unicode.
 * @param text Texto extraído (con espacios entre cada carácter)
 * @returns Texto con las palabras reconstruidas.
 */
const reconstruirTexto = (text: string): string => {
  // Elimina saltos de línea
  const sinSaltos = text.replace(/\n/g, ' ');
  // Remueve los espacios entre caracteres que sean letras, dígitos o ciertos símbolos.
  // Se usa \p{L} para cualquier letra Unicode (requiere la flag 'u').
  const fixedText = sinSaltos.replace(
    /([\p{L}0-9\$\.,:])\s+(?=[\p{L}0-9\$\.,:])/gu,
    '$1',
  );
  return fixedText;
};

export const extractImpuestoInmobiliario = (text: string): number => {
  // Buscamos el patrón "IMPUESTO INMOBILIARIO:" seguido del monto
  const regex = /IMPUESTO INMOBILIARIO\s*:\s*(\$[\d\.,]+)/i;
  const match = regex.exec(text);
  if (match && match[1]) {
    return parseFormattedNumber(match[1]);
  }
  return 0;
};

/**
 * Extrae el valor de "Exp. Extraord." del texto reconstruido.
 * @param text Texto completo del documento.
 * @returns El valor encontrado (por ejemplo, "$0,00") o null si no se halla.
 */
export const extractExpExtraord = (text: string): number => {
  const processedText = reconstruirTexto(text);
  //console.log('Texto procesado:', processedText);
  // El regex busca la secuencia "Exp. Extraord." (sin espacios entre sus letras)
  // seguida opcionalmente de ":" o "-" y luego un signo "$" y el monto.
  const regex = /Exp\.Extraord\.[:\-]?\s*\$([\d\.,]+)/i;
  const match = regex.exec(processedText);
  if (match && match[1]) {
    return parseFormattedNumber(match[1]);
  }
  return 0;
};

/**
 * Convierte un string formateado (por ejemplo, "$5.086,19" o "0,00") a un número.
 * Se asume que el separador de miles es '.' y el separador decimal es ','.
 */
const parseFormattedNumber = (value: string): number => {
  // Elimina el signo "$" y espacios
  const cleaned = value.replace(/\$/g, '').trim();
  // Elimina los separadores de miles y cambia la coma decimal por punto
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized);
};
