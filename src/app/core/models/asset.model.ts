/**
 * Modelos e interfaces para el sistema de gestión de activos
 */

export interface Asset {
  id: number;
  name: string;
  type: AssetType;
  price: number;
  quantity: number;
  status: AssetStatus;
  responsible: string;
  location: string;
  date: string; // ISO format: YYYY-MM-DD
}

export type AssetType = 
  | 'Edificaciones'
  | 'Instalaciones, maquinaria, equipos y muebles'
  | 'Vehículos y equipo caminero'
  | 'Equipos de cómputo y software'
  | 'Barcazas y aeronaves'
  | 'Aviones de fumigación'
  | 'Otros aviones'
  | 'Equipo ferroviario'
  | 'Vehículos de carga'
  | 'Vehículos eléctricos ligeros'
  | 'Equipos de Laboratorio';

export type AssetStatus = 'Disponible' | 'No disponible' | 'En mantenimiento' | 'Dado de baja';

export interface AuditInfo {
  numeroAuditoria: string;
  fechaAuditoria: string;
  auditor: string;
  periodo: {
    inicio: string;
    fin: string;
  };
}

export interface ResumenGeneral {
  totalActivos: number;
  valorTotalInventario: number;
  activosAsignados: number;
  activosDisponibles: number;
  depreciacionEstimada: number;
}

export interface Depreciation {
  anual: number;
  mensual: number;
  acumulada: number;
  valorActual: number;
  porcentaje: number;
  anosUso: number;
}

/**
 * Tasas de depreciación anual por tipo de activo según normativa ecuatoriana
 */
export const DEPRECIATION_RATES: Record<AssetType, number> = {
  'Edificaciones': 0.05,
  'Instalaciones, maquinaria, equipos y muebles': 0.10,
  'Vehículos y equipo caminero': 0.20,
  'Equipos de cómputo y software': 0.33,
  'Barcazas y aeronaves': 0.05,
  'Aviones de fumigación': 0.25,
  'Otros aviones': 0.10,
  'Equipo ferroviario': 0.06,
  'Vehículos de carga': 0.25,
  'Vehículos eléctricos ligeros': 0.25,
  'Equipos de Laboratorio': 0.10
};

/**
 * Interfaz extendida de activo con cálculo de depreciación
 */
export interface AssetWithDepreciation extends Asset {
  depreciation: Depreciation;
}

/**
 * Opciones de filtrado para reportes
 */
export interface ReportFilter {
  year?: number;
  location?: string;
  name?: string;
  status?: AssetStatus;
  type?: AssetType;
  startDate?: string;
  endDate?: string;
}

export interface Alert {
  tipo: AlertType;
  prioridad: AlertPriority;
  mensaje: string;
  activoId?: number;
}

export type AlertType = 'Depreciación' | 'Mantenimiento' | 'Asignación' | 'Valor';
export type AlertPriority = 'Alta' | 'Media' | 'Baja';

export type Criticality = 'Alta' | 'Media' | 'Baja';

export interface CertificadoAsignacion {
  numeroCertificado: string;
  fechaEmision: string;
  activo: Asset;
  institucion: {
    nombre: string;
    siglas: string;
  };
}

export interface Movimiento {
  tipoMovimiento: string;
  fecha: string;
  activo: string;
  destino: string;
  responsable: string;
}
