// src/data/fieldLabels.js
//
// Etiquetas legibles para los campos que extrae el clasificador. La pantalla que
// aparece después de escanear recibe `campos` con la clave técnica (camelCase) y
// con los campos de otros tipos de documento vacíos; aquí se traducen y se
// descartan los que no traen valor.

export const FIELD_LABELS = {
  contribuyente: 'Contribuyente',
  razonSocial: 'Razón social',
  consignatario: 'Consignatario',
  apellidosNombres: 'Apellidos y nombres',
  ruc: 'RUC',
  domicilio: 'Domicilio',
  domicilioFiscal: 'Domicilio fiscal',
  periodo: 'Período',
  fecha: 'Fecha',
  hora: 'Hora',
  fechaEmision: 'Fecha de emisión',
  fechaVencimiento: 'Vencimiento',
  fechaInicio: 'Inicio de actividades',
  fechaDeclaracion: 'Fecha de declaración',
  ingresos: 'Ingresos totales',
  deducciones: 'Deducciones totales',
  rentaNeta: 'Renta neta',
  tributoCalculado: 'Tributo calculado',
  tributo: 'Tributo',
  pagosCuenta: 'Pagos a cuenta',
  saldoAPagar: 'Saldo a pagar',
  totalDeuda: 'Deuda total',
  deudaExigible: 'Deuda exigible',
  intereses: 'Intereses',
  impuestoRenta: 'Impuesto a la renta',
  igv: 'IGV',
  numeroCuotas: 'N° de cuotas',
  modalidad: 'Modalidad',
  condicion: 'Condición',
  numeroActa: 'N° de acta',
  tipoAccion: 'Tipo de acción',
  numeroAccionControl: 'N° de acción de control',
  nombreAccionControl: 'Nombre de la acción de control',
  lugarAccionControl: 'Lugar de control',
  empresaTransportista: 'Empresa transportista',
  tipoVehiculo: 'Tipo de vehículo',
  matricula: 'Matrícula',
  manifiesto: 'Manifiesto',
  procedencia: 'Procedencia',
  destino: 'Destino',
  documentoTransporte: 'Documento de transporte',
  regimenOperacionAduanera: 'Régimen u operación aduanera',
  numeroDeclaracion: 'N° de declaración',
  numeroDocumento: 'N° de documento',
  numeroDocumentoIdentidad: 'N° de documento de identidad',
  tipoDocumentoIdentidad: 'Tipo de documento de identidad',
  tipoPersona: 'Tipo de persona',
  formaIdentificacion: 'Forma de identificación',
  fundamentoHecho: 'Fundamento de hecho',
  fundamentoDerecho: 'Fundamento de derecho',
  bienes: 'Mercancía',
  peso: 'Peso (kg)',
  lugarCustodia: 'Lugar de custodia',
  observaciones: 'Observaciones',
  actividadPrincipal: 'Actividad principal',
  ciiu: 'CIIU',
  regimenTributario: 'Régimen tributario',
  sistemas: 'Sistemas',
};

/** Etiqueta legible: usa el mapa y, si falta, separa el camelCase. */
export function formatFieldLabel(key) {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  const spaced = String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (letter) => letter.toUpperCase());
  return spaced;
}

/** Texto para pintar un valor: los compuestos se resumen, nunca se pintan crudos. */
export function formatFieldValue(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== 'object') return String(item ?? '');
        return item.descripcion || item.numero || '';
      })
      .filter((item) => String(item).trim() !== '')
      .join('; ');
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Campos con valor, ya etiquetados. Los vacíos (y los compuestos sin contenido)
 * no se devuelven: son de otros tipos de documento y solo añadían ruido.
 */
export function visibleFields(campos) {
  return Object.entries(campos || {})
    .map(([key, value]) => ({
      key,
      label: formatFieldLabel(key),
      value: formatFieldValue(value),
    }))
    .filter(({ value }) => value.trim() !== '');
}
