// src/components/ExecutiveReport.jsx
import {
  AREA_CONFIG,
  AREA_OFFICIAL_NAMES,
  AREA_OTRAS,
  TIPOS_CONFIG,
  formatAreaName,
} from '../data/mockDocuments';

// Niveles de urgencia que el backend calcula para el informe (campo `urgencia`).
const URGENCIA_CONFIG = {
  ALTA: {
    label: 'Urgencia alta',
    icon: 'bi-exclamation-octagon',
    bg: 'var(--red-soft)',
    color: 'var(--red)',
  },
  MEDIA: {
    label: 'Urgencia media',
    icon: 'bi-exclamation-circle',
    bg: 'var(--yellow-soft)',
    color: 'var(--yellow)',
  },
  BAJA: {
    label: 'Urgencia baja',
    icon: 'bi-check-circle',
    bg: 'var(--green-soft)',
    color: 'var(--green)',
  },
};

// Claves de datosClave que llegan como código y hay que traducir para mostrarlas.
const DATOS_CLAVE_ESPECIALES = {
  areaDestino: (valor) => ({
    label: 'Área de destino (derivación)',
    texto: formatAreaName(valor),
    config: AREA_CONFIG[valor] || AREA_CONFIG[AREA_OTRAS],
  }),
};

/**
 * Extrae el nivel (ALTA/MEDIA/BAJA) de la urgencia del informe. Algunos informes
 * traen el nivel seguido de una explicación ("ALTA: revisar antes del vencimiento
 * indicado"); ese detalle ya aparece en las alertas, así que aquí se conserva
 * solo el nivel. Devuelve null si no se reconoce ninguno.
 */
function normalizarUrgencia(urgencia) {
  if (typeof urgencia !== 'string') return null;
  const nivel = urgencia.toUpperCase().match(/\b(ALTA|MEDIA|BAJA)\b/);
  return nivel ? nivel[1] : null;
}

export default function ExecutiveReport({ informe, tipoDocumento, area }) {
  if (!informe) return null;

  // El área del documento manda el encabezado: antes estaba fijado a
  // "Intendencia de Recaudación y Control Masivo" incluso para las actas aduaneras.
  const areaLabel = formatAreaName(area);
  const areaConfig = AREA_CONFIG[area] || AREA_CONFIG[AREA_OTRAS];
  const areaOficial = AREA_OFFICIAL_NAMES[area] || areaLabel;
  const tipoConfig = TIPOS_CONFIG[tipoDocumento];
  const tipoLabel = tipoConfig?.label || (tipoDocumento || 'desconocido').replace(/_/g, ' ');

  const formatKey = (key) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

  // Urgencia del informe: se pinta como distintivo en el encabezado. Si el valor
  // no es uno de los niveles conocidos, se muestra tal cual en vez de ocultarlo.
  const urgenciaNivel = normalizarUrgencia(informe.urgencia);
  const urgenciaConfig =
    URGENCIA_CONFIG[urgenciaNivel] ||
    (informe.urgencia
      ? {
          label: `Urgencia: ${informe.urgencia}`,
          icon: 'bi-flag',
          bg: 'var(--yellow-soft)',
          color: 'var(--yellow)',
        }
      : null);

  return (
    <div className="executive-report">
      {/* Header del informe */}
      <div
        className="report-header mb-4 p-3"
        style={{ backgroundColor: areaConfig.bg, borderRadius: '8px 8px 0 0' }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span
              className="badge-soft fs-6 px-3 py-2"
              style={{ backgroundColor: areaConfig.bg, color: areaConfig.text }}
            >
              <i className={`bi ${areaConfig.icon}`} /> {areaLabel}
            </span>
            <span
              className="badge-soft fs-6 px-3 py-2"
              style={{ backgroundColor: 'var(--blue-soft)', color: 'var(--blue)' }}
            >
              <i className={`bi ${tipoConfig?.icon || 'bi-file-earmark-text'}`} /> {tipoLabel}
            </span>
            {urgenciaConfig && (
              <span
                className="badge-soft fs-6 px-3 py-2"
                style={{ backgroundColor: urgenciaConfig.bg, color: urgenciaConfig.color }}
                title={informe.urgencia}
              >
                <i className={`bi ${urgenciaConfig.icon}`} /> {urgenciaConfig.label}
              </span>
            )}
          </div>
          <div className="text-end">
            <div className="text-muted-soft small">INFORME EJECUTIVO OFICIAL</div>
            <div className="fw-bold small">SUNAT - {areaOficial}</div>
          </div>
        </div>
      </div>

      <div className="report-body p-3">
        {/* Contexto */}
        {informe.contexto && (
          <div
            className="report-section mb-4 p-3"
            style={{
              backgroundColor: 'var(--blue-soft)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--blue)',
            }}
          >
            <div className="text-muted-soft small text-uppercase fw-semibold mb-1">CONTEXTO</div>
            <div className="text-muted">{informe.contexto}</div>
          </div>
        )}

        {/* Identificación */}
        {informe.identificacion && Object.keys(informe.identificacion).length > 0 && (
          <div className="report-section mb-4">
            <div className="text-muted-soft small text-uppercase fw-semibold mb-2">
              IDENTIFICACIÓN DEL CONTRIBUYENTE
            </div>
            <div className="row">
              {Object.entries(informe.identificacion).map(
                ([key, value]) =>
                  value && (
                    <div key={key} className="col-md-6 mb-2">
                      <div className="text-muted-soft small">{formatKey(key)}</div>
                      <div className="fw-semibold">{value}</div>
                    </div>
                  ),
              )}
            </div>
          </div>
        )}

        {/* Datos Clave */}
        {informe.datosClave && Object.keys(informe.datosClave).length > 0 && (
          <div className="report-section mb-4">
            <div className="text-muted-soft small text-uppercase fw-semibold mb-2">
              DATOS CLAVE DEL DOCUMENTO
            </div>
            <div className="row">
              {Object.entries(informe.datosClave).map(([key, value]) => {
                if (value === null || value === undefined || value === '') return null;
                // La derivación llega como código de área
                // (p. ej. PREVENCION_CONTRABANDO_FISCALIZACION_ADUANERA): se
                // muestra con el nombre y el color del área, no como código.
                const especial = DATOS_CLAVE_ESPECIALES[key];
                if (especial && typeof value === 'string') {
                  const { label, texto, config } = especial(value);
                  return (
                    <div key={key} className="col-md-6 mb-2">
                      <div className="text-muted-soft small">{label}</div>
                      <div className="fw-semibold d-flex align-items-center gap-1">
                        <i className={`bi ${config.icon}`} style={{ color: config.text }} />
                        {texto}
                      </div>
                    </div>
                  );
                }
                if (typeof value === 'object' && !Array.isArray(value)) {
                  return Object.entries(value).map(([subKey, subValue]) => (
                    <div key={`${key}.${subKey}`} className="col-md-6 mb-2">
                      <div className="text-muted-soft small">{formatKey(`${key}.${subKey}`)}</div>
                      <div className="fw-semibold">{subValue}</div>
                    </div>
                  ));
                }
                if (Array.isArray(value)) {
                  return (
                    <div key={key} className="col-12 mb-2">
                      <div className="text-muted-soft small">{formatKey(key)}</div>
                      <ul className="mb-0 ps-3">
                        {value.map((item, i) => (
                          <li key={i} className="fw-semibold small">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return (
                  <div key={key} className="col-md-6 mb-2">
                    <div className="text-muted-soft small">{formatKey(key)}</div>
                    <div className="fw-semibold">{value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Análisis de Riesgo */}
        {informe.analisisRiesgo && Object.keys(informe.analisisRiesgo).length > 0 && (
          <div
            className="report-section mb-4 p-3"
            style={{
              backgroundColor: 'var(--yellow-soft)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--yellow)',
            }}
          >
            <div className="text-muted-soft small text-uppercase fw-semibold mb-2">
              ANÁLISIS DE RIESGO
            </div>
            <div className="row">
              {Object.entries(informe.analisisRiesgo).map(([key, value]) => (
                <div key={key} className="col-md-6 mb-2">
                  <div className="text-muted-soft small">{formatKey(key)}</div>
                  <div
                    className="fw-semibold"
                    style={{
                      color:
                        value === 'ALTO' || value === 'ALERTA' || value === 'SOSPECHOSA'
                          ? 'var(--red)'
                          : value === 'MEDIO'
                            ? 'var(--yellow)'
                            : 'var(--green)',
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado / Cumplimiento */}
        {(informe.estado || informe.analisisCumplimiento) && (
          <div
            className="report-section mb-4 p-3"
            style={{
              backgroundColor: 'var(--green-soft)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--green)',
            }}
          >
            <div className="text-muted-soft small text-uppercase fw-semibold mb-2">
              {informe.estado ? 'ESTADO' : 'CUMPLIMIENTO'}
            </div>
            <div className="row">
              {informe.estado && (
                <div className="col-md-6 mb-2">
                  <div className="text-muted-soft small">Estado</div>
                  <div
                    className="fw-semibold badge-soft"
                    style={{
                      backgroundColor:
                        informe.estado === 'VIGENTE'
                          ? 'var(--green-soft)'
                          : informe.estado === 'CADUCADO'
                            ? 'var(--red-soft)'
                            : 'var(--yellow-soft)',
                    }}
                  >
                    {informe.estado}
                  </div>
                </div>
              )}
              {informe.analisisCumplimiento &&
                Object.entries(informe.analisisCumplimiento).map(([key, value]) => (
                  <div key={key} className="col-md-6 mb-2">
                    <div className="text-muted-soft small">{formatKey(key)}</div>
                    <div className="fw-semibold">{value}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Alertas */}
        {informe.alertas && informe.alertas.length > 0 && (
          <div
            className="report-section mb-4 p-3"
            style={{
              backgroundColor: 'var(--red-soft)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--red)',
            }}
          >
            <div className="text-muted-soft small text-uppercase fw-semibold mb-2 d-flex align-items-center gap-1">
              <i className="bi bi-exclamation-triangle" /> ALERTAS Y OBSERVACIONES
            </div>
            <ul className="mb-0 ps-3">
              {informe.alertas.map((alerta, i) => (
                <li key={i} className="small fw-semibold">
                  {alerta}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Acciones Requeridas */}
        {informe.accionesRequeridas && informe.accionesRequeridas.length > 0 && (
          <div
            className="report-section mb-4 p-3"
            style={{
              backgroundColor: 'var(--blue-soft)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--blue)',
            }}
          >
            <div className="text-muted-soft small text-uppercase fw-semibold mb-2 d-flex align-items-center gap-1">
              <i className="bi bi-check-circle" /> ACCIONES REQUERIDAS
            </div>
            <ol className="mb-0 ps-3">
              {informe.accionesRequeridas.map((accion, i) => (
                <li key={i} className="small fw-semibold mb-1">
                  {accion}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Resumen Ejecutivo Corto */}
        {informe.resumenEjecutivo && (
          <div
            className="report-section mb-4 p-3"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          >
            <div className="text-muted-soft small text-uppercase fw-semibold mb-2">
              RESUMEN EJECUTIVO
            </div>
            <div className="fw-semibold">{informe.resumenEjecutivo}</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="report-footer mt-4 pt-3 border-top text-center text-muted-soft small">
        <div>Informe generado automáticamente por IA - SUNAT</div>
        <div className="text-muted-soft small">
          Área: {areaLabel} | Fecha: {new Date().toLocaleDateString('es-PE')}
        </div>
      </div>
    </div>
  );
}
