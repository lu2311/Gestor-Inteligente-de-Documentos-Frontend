// src/data/mockDocuments.js

// Área aduanera: actas de inmovilización/incautación (fiscalización aduanera).
// Es la que asigna el backend en `src/domain/sunat/areas.ts`.
export const AREA_FISCALIZACION_ADUANERA = 'PREVENCION_CONTRABANDO_FISCALIZACION_ADUANERA';

// Bolsa para áreas no reconocidas (valores antiguos como "INTENDENCIA", "Contabilidad"
// o documentos sin derivación): evita que un documento desaparezca de las tarjetas y
// filtros por área.
export const AREA_OTRAS = 'OTRAS_AREAS';

export const AREAS = [
  'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
  'INTENDENCIA_FISCALIZACION',
  AREA_FISCALIZACION_ADUANERA,
];

export const AREA_LABELS = {
  INTENDENCIA_RECAUDACION_CONTROL_MASIVO: 'Recaudación y Control Masivo',
  INTENDENCIA_FISCALIZACION: 'Fiscalización',
  [AREA_FISCALIZACION_ADUANERA]: 'Fiscalización Aduanera',
  [AREA_OTRAS]: 'Otras áreas',
  Contabilidad: 'Contabilidad',
  'Mesa de Partes': 'Mesa de Partes',
};

/** Nombre oficial completo, para el encabezado del informe ejecutivo. */
export const AREA_OFFICIAL_NAMES = {
  INTENDENCIA_RECAUDACION_CONTROL_MASIVO: 'Intendencia de Recaudación y Control Masivo',
  INTENDENCIA_FISCALIZACION: 'Intendencia de Fiscalización',
  [AREA_FISCALIZACION_ADUANERA]:
    'Intendencia de Prevención del Contrabando y Fiscalización Aduanera',
  [AREA_OTRAS]: 'Áreas no clasificadas',
};

/** ¿El área está entre las reconocidas por la aplicación? */
export function isKnownArea(area) {
  return AREAS.includes(area);
}

/** Un documento pertenece al área indicada; cualquier área desconocida cae en Otras áreas. */
export function docMatchesArea(doc, areaKey) {
  if (areaKey === AREA_OTRAS) return !isKnownArea(doc?.area);
  return doc?.area === areaKey;
}

export function formatAreaName(area) {
  if (!area) return 'General';
  if (AREA_LABELS[area]) return AREA_LABELS[area];
  return area
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function cleanTextEncoding(str) {
  if (!str) return '';
  try {
    const decoded = decodeURIComponent(escape(str));
    if (decoded && !decoded.includes('Ã')) return decoded;
  } catch {
    // La decodificación es opcional: si falla, se devuelve el texto original.
  }

  return str
    .replace(/Ã[\u0080-\u009f]?N/g, 'ÓN')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ã\u0093/g, 'Ó')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã\u0081/g, 'Á')
    .replace(/Ã\u0089/g, 'É')
    .replace(/Ã\u008d/g, 'Í')
    .replace(/Ã\u00da/g, 'Ú')
    .replace(/Ã\u0091/g, 'Ñ')
    .replace(/ÃN/g, 'ÓN');
}

export const AREA_CONFIG = {
  INTENDENCIA_RECAUDACION_CONTROL_MASIVO: {
    text: 'var(--area-intendencia-text, #1d4ed8)',
    bg: 'var(--area-intendencia-bg, #eff6ff)',
    icon: 'bi-building',
  },
  INTENDENCIA_FISCALIZACION: {
    text: 'var(--red, #c0392b)',
    bg: 'var(--red-soft, #fde8e8)',
    icon: 'bi-shield-check',
  },
  [AREA_FISCALIZACION_ADUANERA]: {
    text: 'var(--yellow, #a9720b)',
    bg: 'var(--yellow-soft, #fdf3d8)',
    icon: 'bi-shield-exclamation',
  },
  [AREA_OTRAS]: {
    text: 'var(--muted, #6b7280)',
    bg: 'var(--border, #e5e7eb)',
    icon: 'bi-question-circle',
  },
  Contabilidad: {
    text: 'var(--area-finanzas-text, #2456c9)',
    bg: 'var(--area-finanzas-bg, #eaf1fd)',
    icon: 'bi-calculator',
  },
  'Mesa de Partes': {
    text: 'var(--blue, #2f5fdb)',
    bg: 'var(--blue-soft, #eaf0fe)',
    icon: 'bi-inbox',
  },
};

const FALLBACK_AREA_CONFIG = {
  text: 'var(--muted, #6b7280)',
  bg: 'var(--border, #e5e7eb)',
  icon: 'bi-building',
};

/**
 * Reparte los documentos por área para las tarjetas y filtros.
 * Devuelve siempre las áreas conocidas (en orden y aunque estén a 0) y añade una
 * fila final "Otras áreas" solo si hay documentos con un área no reconocida, de
 * forma que ningún documento quede sin contabilizar.
 */
export function getAreaDistribution(documentos = []) {
  const counts = new Map();
  documentos.forEach((doc) => {
    const area = isKnownArea(doc?.area) ? doc.area : AREA_OTRAS;
    counts.set(area, (counts.get(area) || 0) + 1);
  });

  const filas = AREAS.map((area) => ({
    area,
    label: formatAreaName(area),
    count: counts.get(area) || 0,
    config: AREA_CONFIG[area] || FALLBACK_AREA_CONFIG,
  }));

  const otras = counts.get(AREA_OTRAS) || 0;
  if (otras > 0) {
    filas.push({
      area: AREA_OTRAS,
      label: formatAreaName(AREA_OTRAS),
      count: otras,
      config: AREA_CONFIG[AREA_OTRAS] || FALLBACK_AREA_CONFIG,
    });
  }

  return filas;
}

export const COLOR_MAP = {
  blue: { bg: 'var(--blue-soft, #eaf0fe)', text: 'var(--blue, #2f5fdb)' },
  green: { bg: 'var(--green-soft, #e5f7ea)', text: 'var(--green, #16a34a)' },
  orange: { bg: 'var(--yellow-soft, #fdf3d8)', text: 'var(--yellow, #a9720b)' },
  purple: {
    bg: 'var(--area-formulario-2119-bg, #f5f3ff)',
    text: 'var(--area-formulario-2119-text, #7c3aed)',
  },
  red: { bg: 'var(--red-soft, #fde8e8)', text: 'var(--red, #c0392b)' },
};

export function getAreaByDocType(tipo) {
  const mapping = {
    DECLARACION_JURADA_MENSUAL: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    DECLARACION_JURADA_ANUAL: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    RESOLUCION_FRACCIONAMIENTO: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    RESOLUCION_APLAZAMIENTO: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    RESOLUCION_APLAZAMIENTO_FRACCIONAMIENTO: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    ORDEN_PAGO_OP: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    SOLICITUD_INSCRIPCION_RUC: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    ACTUALIZACION_RUC: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    RESOLUCION_DETERMINACION_RD: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    RESOLUCION_MULTA_RM: 'INTENDENCIA_FISCALIZACION',
    REQUERIMIENTO_FISCALIZACION: 'INTENDENCIA_FISCALIZACION',
    AUDITORIA_LIBROS: 'INTENDENCIA_FISCALIZACION',
    CARTA_PRESENTACION: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    NOTIFICACION_ELECTRONICA: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    SOLICITUD_APLAZAMIENTO: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    ACTA_INMOVILIZACION: AREA_FISCALIZACION_ADUANERA,
    ACTA_INCAUTACION: AREA_FISCALIZACION_ADUANERA,
  };
  return mapping[tipo] || 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO';
}

export function getDestinationEmail(tipoDocumento, area) {
  const map = {
    DECLARACION_JURADA_MENSUAL: 'declaraciones.mensuales@sunat.gob.pe',
    DECLARACION_JURADA_ANUAL: 'declaraciones.anuales@sunat.gob.pe',
    RESOLUCION_FRACCIONAMIENTO: 'fraccionamiento.deudas@sunat.gob.pe',
    RESOLUCION_APLAZAMIENTO: 'fraccionamiento.deudas@sunat.gob.pe',
    RESOLUCION_APLAZAMIENTO_FRACCIONAMIENTO: 'fraccionamiento.deudas@sunat.gob.pe',
    ORDEN_PAGO_OP: 'ordenes.pago@sunat.gob.pe',
    SOLICITUD_INSCRIPCION_RUC: 'registro.ruc@sunat.gob.pe',
    ACTUALIZACION_RUC: 'registro.ruc@sunat.gob.pe',
    RESOLUCION_DETERMINACION_RD: 'determinacion.tributaria@sunat.gob.pe',
    RESOLUCION_MULTA_RM: 'fiscalizacion.multas@sunat.gob.pe',
    REQUERIMIENTO_FISCALIZACION: 'fiscalizacion.control@sunat.gob.pe',
    AUDITORIA_LIBROS: 'fiscalizacion.libros@sunat.gob.pe',
    CARTA_PRESENTACION: 'mesa.partes@sunat.gob.pe',
    NOTIFICACION_ELECTRONICA: 'buzon.electronico@sunat.gob.pe',
    SOLICITUD_APLAZAMIENTO: 'fraccionamiento.deudas@sunat.gob.pe',
    ACTA_INMOVILIZACION: 'aduanas.fiscalizacion@sunat.gob.pe',
    ACTA_INCAUTACION: 'aduanas.fiscalizacion@sunat.gob.pe',
  };

  if (tipoDocumento && map[tipoDocumento]) {
    return map[tipoDocumento];
  }
  if (area && area.includes('FISCALIZACION')) {
    return 'fiscalizacion.control@sunat.gob.pe';
  }
  return 'mesa.partes.digital@sunat.gob.pe';
}

export const TIPOS_CONFIG = {
  DECLARACION_JURADA_MENSUAL: {
    label: 'Declaración Jurada Mensual',
    icon: 'bi-file-earmark-text',
    color: 'blue',
  },
  DECLARACION_JURADA_ANUAL: {
    label: 'Declaración Jurada Anual',
    icon: 'bi-file-earmark-text',
    color: 'blue',
  },
  RESOLUCION_FRACCIONAMIENTO: {
    label: 'Resolución Fraccionamiento',
    icon: 'bi-calendar-check',
    color: 'green',
  },
  RESOLUCION_APLAZAMIENTO: {
    label: 'Resolución Aplazamiento',
    icon: 'bi-calendar-check',
    color: 'green',
  },
  ORDEN_PAGO_OP: { label: 'Orden de Pago', icon: 'bi-cash-stack', color: 'orange' },
  SOLICITUD_INSCRIPCION_RUC: {
    label: 'Solicitud Inscripción RUC',
    icon: 'bi-person-badge',
    color: 'purple',
  },
  ACTUALIZACION_RUC: { label: 'Actualización RUC', icon: 'bi-person-badge', color: 'purple' },
  RESOLUCION_DETERMINACION_RD: {
    label: 'Resolución Determinación',
    icon: 'bi-file-earmark-text',
    color: 'red',
  },
  RESOLUCION_MULTA_RM: { label: 'Resolución Multa', icon: 'bi-exclamation-triangle', color: 'red' },
  REQUERIMIENTO_FISCALIZACION: {
    label: 'Requerimiento Fiscalización',
    icon: 'bi-search',
    color: 'red',
  },
  AUDITORIA_LIBROS: { label: 'Auditoría Libros', icon: 'bi-journal-text', color: 'red' },
  CARTA_PRESENTACION: { label: 'Carta Presentación', icon: 'bi-envelope', color: 'blue' },
  NOTIFICACION_ELECTRONICA: { label: 'Notificación Electrónica', icon: 'bi-bell', color: 'blue' },
  SOLICITUD_APLAZAMIENTO: {
    label: 'Solicitud Aplazamiento',
    icon: 'bi-calendar-check',
    color: 'green',
  },
  RESOLUCION_APLAZAMIENTO_FRACCIONAMIENTO: {
    label: 'Resolución Aplazamiento/Fracc.',
    icon: 'bi-calendar-check',
    color: 'green',
  },
  ACTA_INMOVILIZACION: {
    label: 'Acta de Inmovilización',
    icon: 'bi-shield-exclamation',
    color: 'red',
  },
  ACTA_INCAUTACION: { label: 'Acta de Incautación', icon: 'bi-shield-x', color: 'red' },
};

export const STATUS_CONFIG = {
  Procesado: { text: 'var(--green)', bg: 'var(--green-soft)', icon: 'bi-check-circle-fill' },
  'En cola': { text: 'var(--yellow)', bg: 'var(--yellow-soft)', icon: 'bi-hourglass-split' },
  Fallido: { text: 'var(--red)', bg: 'var(--red-soft)', icon: 'bi-x-circle-fill' },
};

// mockDocuments con 10 docs representativos de los 15 tipos
export const mockDocuments = [
  {
    id: 'doc-1',
    nombre: 'declaracion_jurada_mensual_1.pdf',
    tipoDocumento: 'DECLARACION_JURADA_MENSUAL',
    area: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    estado: 'Procesado',
    fecha: '03/09/26',
    hora: '14:30',
    categoriaConfianza: 97,
    datos: {
      tipo: 'Declaración Jurada Mensual',
      periodo: '08/2026',
      ingresos: 'S/ 45,800.00',
      rentaNeta: 'S/ 15,700.00',
    },
    resumen:
      'Declaración Jurada Mensual del periodo 08/2026. Ingresos declarados S/ 45,800.00. Renta neta S/ 15,700.00.',
    correoDerivacion: 'declaraciones@sunat.gob.pe',
  },
  {
    id: 'doc-2',
    nombre: 'resolucion_fraccionamiento_1.pdf',
    tipoDocumento: 'RESOLUCION_FRACCIONAMIENTO',
    area: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    estado: 'Procesado',
    fecha: '03/09/26',
    hora: '13:15',
    categoriaConfianza: 98,
    datos: { numeroResolucion: 'RES-FRAC-2026-0089', cuotas: 12, primeraVencimiento: '05/08/2026' },
    resumen:
      'Resolución de Fraccionamiento RES-FRAC-2026-0089. Deuda fraccionada en 12 cuotas. Primera vence 05/08/2026.',
    correoDerivacion: 'fraccionamiento@sunat.gob.pe',
  },
  {
    id: 'doc-3',
    nombre: 'orden_pago_1.pdf',
    tipoDocumento: 'ORDEN_PAGO_OP',
    area: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    estado: 'Procesado',
    fecha: '03/09/26',
    hora: '12:00',
    categoriaConfianza: 96,
    datos: {
      numeroOrden: 'OP-2026-000453',
      totalDeuda: 'S/ 1,518.20',
      fechaVencimiento: '04/08/2026',
    },
    resumen:
      'Orden de Pago OP-2026-000453. Total deuda S/ 1,518.20. Fecha de vencimiento 04/08/2026.',
    correoDerivacion: 'ordenes_pago@sunat.gob.pe',
  },
  {
    id: 'doc-4',
    nombre: 'formulario_2119_1.pdf',
    tipoDocumento: 'SOLICITUD_INSCRIPCION_RUC',
    area: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    estado: 'Procesado',
    fecha: '03/09/26',
    hora: '11:30',
    categoriaConfianza: 98,
    datos: {
      ruc: '20601234567',
      actividad: '7020 - Consultoria',
      domicilio: 'Av. Javier Prado 1230, San Isidro',
    },
    resumen:
      'Formulario 2119 - Solicitud de Inscripcion al RUC. Contribuyente inscrito con actividad economica 7020 - Consultoria.',
    correoDerivacion: 'ruc_inscripciones@sunat.gob.pe',
  },
  {
    id: 'doc-5',
    nombre: 'resolucion_fraccionamiento_2.pdf',
    tipoDocumento: 'RESOLUCION_FRACCIONAMIENTO',
    area: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    estado: 'En cola',
    fecha: '02/09/26',
    hora: '09:20',
    categoriaConfianza: 93,
    datos: { numeroResolucion: 'RES-FRAC-2026-0156', cuotas: 24, primeraVencimiento: '10/09/2026' },
    resumen: 'Resolución de Fraccionamiento RES-FRAC-2026-0156. Deuda fraccionada en 24 cuotas.',
    correoDerivacion: 'fraccionamiento@sunat.gob.pe',
  },
  {
    id: 'doc-6',
    nombre: 'orden_pago_2.pdf',
    tipoDocumento: 'ORDEN_PAGO_OP',
    area: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    estado: 'Fallido',
    fecha: '01/09/26',
    hora: '16:10',
    categoriaConfianza: 0,
    datos: { proveedor: '-', fecha: '-', monto: '-', numeroDocumento: '-' },
    resumen:
      'El archivo esta danado y no pudo procesarse. Se recomienda volver a escanear el documento.',
    correoDerivacion: null,
  },
  {
    id: 'doc-7',
    nombre: 'resolucion_anual_1.pdf',
    tipoDocumento: 'DECLARACION_JURADA_ANUAL',
    area: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    estado: 'Procesado',
    fecha: '31/08/26',
    hora: '10:20',
    categoriaConfianza: 97,
    datos: { tipo: 'Declaración Jurada Anual', ejercicio: '2025', rentaNeta: 'S/ 185,400.00' },
    resumen: 'Declaración Jurada Anual 2025. Renta neta declarada S/ 185,400.00.',
    correoDerivacion: 'declaraciones@sunat.gob.pe',
  },
  {
    id: 'doc-8',
    nombre: 'actualizacion_ruc_1.pdf',
    tipoDocumento: 'ACTUALIZACION_RUC',
    area: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    estado: 'Procesado',
    fecha: '31/08/26',
    hora: '15:00',
    categoriaConfianza: 97,
    datos: {
      ruc: '20456789123',
      actividad: '6201 - Desarrollo software',
      domicilio: 'Calle Los Sauces 456, La Molina',
    },
    resumen:
      'Formulario 2119 - Actualizacion RUC. Cambio de domicilio fiscal y actividad economica.',
    correoDerivacion: 'ruc_inscripciones@sunat.gob.pe',
  },
  {
    id: 'doc-9',
    nombre: 'orden_pago_3.pdf',
    tipoDocumento: 'ORDEN_PAGO_OP',
    area: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    estado: 'Procesado',
    fecha: '31/08/26',
    hora: '10:20',
    categoriaConfianza: 97,
    datos: {
      numeroOrden: 'OP-2026-000789',
      totalDeuda: 'S/ 3,250.00',
      fechaVencimiento: '05/09/2026',
    },
    resumen: 'Orden de Pago OP-2026-000789. Total deuda S/ 3,250.00.',
    correoDerivacion: 'ordenes_pago@sunat.gob.pe',
  },
  {
    id: 'doc-10',
    nombre: 'resolucion_fraccionamiento_3.pdf',
    tipoDocumento: 'RESOLUCION_FRACCIONAMIENTO',
    area: 'INTENDENCIA_RECAUDACION_CONTROL_MASIVO',
    estado: 'En cola',
    fecha: '31/08/26',
    hora: '09:00',
    categoriaConfianza: 90,
    datos: { numeroResolucion: 'RES-FRAC-2026-0234', cuotas: 18, primeraVencimiento: '15/09/2026' },
    resumen: 'Resolución de Fraccionamiento RES-FRAC-2026-0234. Deuda fraccionada en 18 cuotas.',
    correoDerivacion: 'fraccionamiento@sunat.gob.pe',
  },
];

export const demoFiles = [
  { nombre: 'declaracion_jurada_mensual.pdf', icon: 'bi-file-earmark-text', resultId: 'doc-1' },
  { nombre: 'resolucion_fraccionamiento.pdf', icon: 'bi-file-earmark-text', resultId: 'doc-2' },
  { nombre: 'orden_pago.pdf', icon: 'bi-file-earmark-text', resultId: 'doc-3' },
  { nombre: 'formulario_2119.pdf', icon: 'bi-file-earmark-person', resultId: 'doc-4' },
];

export const PROCESSING_STEPS = [
  'Subiendo documento...',
  'Extrayendo texto con OCR...',
  'Clasificando con IA...',
  'Derivando al area correspondiente...',
];
