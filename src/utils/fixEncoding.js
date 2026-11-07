// Corrige nombres de archivo que llegaron como UTF-8 interpretado como
// Windows-1252 (mojibake): "Solicitud_de_InscripciÃ³n" -> "Solicitud_de_Inscripción".
//
// No se limita a reemplazos de pares concretos porque un simple
// `.replace(/Ã/g, 'Ó')` consume todos los caracteres "Ã" de la cadena y deja
// sin efecto las reglas siguientes (era el bug de la versión anterior).

// Caracteres de Windows-1252 (0x80-0x9F) que no coinciden con Latin-1.
const CP1252_BYTES = new Map([
  ['\u20AC', 0x80],
  ['\u201A', 0x82],
  ['\u0192', 0x83],
  ['\u201E', 0x84],
  ['\u2026', 0x85],
  ['\u2020', 0x86],
  ['\u2021', 0x87],
  ['\u02C6', 0x88],
  ['\u2030', 0x89],
  ['\u0160', 0x8a],
  ['\u2039', 0x8b],
  ['\u0152', 0x8c],
  ['\u017D', 0x8e],
  ['\u2018', 0x91],
  ['\u2019', 0x92],
  ['\u201C', 0x93],
  ['\u201D', 0x94],
  ['\u2022', 0x95],
  ['\u2013', 0x96],
  ['\u2014', 0x97],
  ['\u02DC', 0x98],
  ['\u2122', 0x99],
  ['\u0161', 0x9a],
  ['\u203A', 0x9b],
  ['\u0153', 0x9c],
  ['\u017E', 0x9e],
  ['\u0178', 0x9f],
]);

// El texto parece mojibake solo si contiene caracteres Latin-1 o CP1252.
const MOJIBAKE_HINT = /[\u00C0-\u00FF\u2018-\u2122]/;

/** Intenta reinterpretar la cadena como bytes Latin-1/CP1252 decodificados en UTF-8. */
function decodeOnce(value) {
  const bytes = [];

  for (const char of value) {
    const code = char.codePointAt(0);
    if (code <= 0xff) {
      bytes.push(code);
      continue;
    }

    const mapped = CP1252_BYTES.get(char);
    if (mapped === undefined) return null; // Contiene Unicode real: no es mojibake.
    bytes.push(mapped);
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    return null; // La secuencia no es UTF-8 válida: se deja el texto original.
  }
}

export function fixEncoding(value) {
  if (!value || typeof value !== 'string') return value;

  let current = value;
  // Dos pasadas cubren también la doble codificación ("ÃƒÂ³").
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (!MOJIBAKE_HINT.test(current)) break;
    const decoded = decodeOnce(current);
    if (decoded === null || decoded === current) break;
    current = decoded;
  }

  return current;
}
