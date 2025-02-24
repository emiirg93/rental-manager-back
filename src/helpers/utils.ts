import * as pdfjsLib from 'pdfjs-dist';
import { DetalleAlquiler } from '../interfaces/detalle-alquiler.interface';

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

export const extractSaldoAPagarABL = (text: string): number => {
  // Buscamos el patrón "SALDO A PAGAR" seguido del monto.
  const regex = /SALDO A PAGAR\s*(\$[\d\.,]+)/i;
  const match = regex.exec(text);
  if (match && match[1]) {
    return parseFormattedNumber(match[1]);
  }
  return 0;
};

export const extractTotalExpensas = (text: string): number => {
  // La expresión regular busca "Total", seguido de "1" y, opcionalmente, un "º" o "o", luego "vto:" y
  // cualquier contenido hasta encontrar el signo "$" y capturar el monto.
  const processedText = reconstruirTexto(text);
  const regex = /Total\s*1\s*[ºo]?\s*vto:[\s\S]*?\$\s*([\d\.,]+)/i;
  const match = regex.exec(processedText);
  if (match && match[1]) {
    return parseFormattedNumber('$' + match[1].trim());
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

export const tamplateHTML = (detalleAlquiler: DetalleAlquiler) => {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="es">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Detalle de Pago de Alquiler</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7fafc; color: #2d3748;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
                <td align="center" style="padding: 40px 0; background-color: #4a5568;">
                    <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Detalle Pago Alquiler</h1>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <tr>
                            <td style="padding: 15px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td style="font-weight: bold; font-size: 18px; color: #4a5568;">Alquiler</td>
                                        <td align="right" style="font-weight: bold; font-size: 18px; color: #4299e1;">$ 317.000</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <tr>
                            <td style="padding: 15px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td style="font-weight: bold; font-size: 18px; color: #4a5568;">ABL</td>
                                        <td align="right" style="font-weight: bold; font-size: 18px; color: #4299e1;">$ ${detalleAlquiler.abl.totalAbl}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 15px 15px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td width="50%" style="padding: 10px; background-color: #f7fafc; border-radius: 4px;">
                                            <p style="margin: 0; font-size: 14px; color: #718096;">Impuesto inmobiliario</p>
                                            <p style="margin: 5px 0 0; font-size: 16px; font-weight: bold; color: #2d3748;">$ ${detalleAlquiler.abl.impuestoInmobiliario}</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <tr>
                            <td style="padding: 15px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td style="font-weight: bold; font-size: 18px; color: #4a5568;">Expensas</td>
                                        <td align="right" style="font-weight: bold; font-size: 18px; color: #4299e1;">$ ${detalleAlquiler.expensas.totalExpensas}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 15px 15px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td width="50%" style="padding: 10px; background-color: #f7fafc; border-radius: 4px;">
                                            <p style="margin: 0; font-size: 14px; color: #718096;">Extraordinarias</p>
                                            <p style="margin: 5px 0 0; font-size: 16px; font-weight: bold; color: #2d3748;">$ ${detalleAlquiler.expensas.extraordinarias}</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; background-color: #4299e1; border-radius: 8px;">
                        <tr>
                            <td align="center" style="padding: 20px;">
                                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #ffffff;">Total a Pagar - ${monthName()}</p>
                                <p style="margin: 10px 0 0; font-size: 24px; font-weight: bold; color: #ffffff;">$ ${detalleAlquiler.alquiler}</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #718096; font-style: italic; text-align: center;">Gracias por todo. Cualquier consulta, estamos en contacto.</p>
                    <p style="margin: 0; font-size: 16px; font-weight: bold; color: #4a5568; text-align: center;">Emiliano Rago - Colpayo 616 6B</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
};

export const monthName = () => {
  const nombreMes = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(
    new Date(),
  );
  // Capitalizar la primera letra y mantener el resto en minúsculas
  return nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
};
