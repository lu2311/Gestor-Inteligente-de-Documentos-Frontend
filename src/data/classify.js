import { AREA_CONFIG } from './mockDocuments';

// Motor de clasificación por palabras clave en el nombre del archivo.
// En la versión final esto lo hará el backend (OCR + IA), aquí se simula
// para que CUALQUIER archivo que el usuario suba (no solo los demo) reciba
// una categoría, datos extraídos y un resumen coherentes.
const RULES = [
  { area: 'Finanzas', confidence: 97, regex: /factura|invoice|boleta|recibo|pago|cobro|monto|ruc|igv|tribut/i },
  { area: 'RRHH', confidence: 94, regex: /contrato|emplead|n[oó]mina|personal|rrhh|recursos.?humanos|vacac|cv|curriculum/i },
  { area: 'Logística', confidence: 91, regex: /guia|env[ií]o|despacho|logistic|transporte|almac[eé]n|entrega|pedido/i },
  { area: 'Compras', confidence: 89, regex: /orden.?compra|compra|cotizaci[oó]n|proveedor|adquisici[oó]n|licitaci[oó]n/i },
  { area: 'IT', confidence: 93, regex: /ticket|incidencia|soporte|servidor|red\b|sistema|hardware|software|mantenimiento|vpn/i },
];

const CATEGORY_TEMPLATES = {
  Finanzas: {
    datos: { proveedor: 'Proveedor SAC', fecha: '28/08/2026', monto: 'S/ 1,500.50', numeroDocumento: 'F-001-2026' },
    resumen:
      'Factura correspondiente a servicios de consultoría. El monto total asciende a S/ 1,500.50. Proveedor registrado con RUC 20601234567. Se recomienda aprobación del área de Finanzas en 5 días hábiles.',
  },
  RRHH: {
    datos: { proveedor: 'María Quispe', fecha: '28/08/2026', monto: 'Contrato indefinido', numeroDocumento: 'C-042-2026' },
    resumen:
      'Contrato laboral de incorporación para el área de Operaciones. Incluye cláusulas de confidencialidad y periodo de prueba de 3 meses. Requiere firma del jefe de RRHH y del colaborador.',
  },
  Logística: {
    datos: { proveedor: 'LogiTrans Perú', fecha: '28/08/2026', monto: 'Almacén Lima Norte', numeroDocumento: 'GR-2026-0089' },
    resumen:
      'Guía de remisión para traslado de mercancía hacia almacén de Lima Norte. Incluye 48 unidades de producto SKU-4421. El transportista debe confirmar recepción dentro de 24 horas.',
  },
  Compras: {
    datos: { proveedor: 'TechSupplies SAC', fecha: '28/08/2026', monto: 'S/ 8,750.00', numeroDocumento: 'OC-2026-0312' },
    resumen:
      'Orden de compra para adquisición de equipos de cómputo. Se solicitaron 5 laptops modelo Dell Latitude. El proveedor tiene 10 días hábiles para entregar. Aprobada por el área de Compras.',
  },
  IT: {
    datos: { proveedor: 'Ticket INC-2026-1204', fecha: '28/08/2026', monto: 'Prioridad alta', numeroDocumento: 'INC-2026-1204' },
    resumen:
      'Reporte de incidencia técnica relacionada con falla de conectividad VPN en sede Miraflores. Afecta a 12 usuarios. El equipo de IT Nivel 2 ha sido notificado y está coordinando la solución.',
  },
};

const ALL_AREAS = Object.keys(CATEGORY_TEMPLATES);

export function classifyDocument(filename) {
  const name = (filename || '').toLowerCase();

  for (const rule of RULES) {
    if (rule.regex.test(name)) {
      return buildResult(rule.area, rule.confidence + Math.floor(Math.random() * 3));
    }
  }

  // Sin coincidencias: elige un área al azar con confianza más baja (como haría
  // un modelo real ante un documento ambiguo).
  const fallbackArea = ALL_AREAS[Math.floor(Math.random() * ALL_AREAS.length)];
  return buildResult(fallbackArea, 72 + Math.floor(Math.random() * 10));
}

function buildResult(area, confidence) {
  const template = CATEGORY_TEMPLATES[area];
  return {
    area,
    confidence,
    datos: template.datos,
    resumen: template.resumen,
    correo: AREA_CONFIG[area].correo,
  };
}
