/**
 * Constantes de la aplicación
 * Valores reutilizables en toda la aplicación
 */

// Tipos de activos disponibles
export const ASSET_TYPES = [
  'Computadora',
  'Impresora',
  'Mobiliario',
  'Vehículo',
  'Equipo de Red',
  'Servidor',
  'Equipos de Laboratorio',
  'Material Didáctico',
  'Otro'
] as const;

// Estados posibles de un activo
export const ASSET_STATUS = [
  'Disponible',
  'Asignado',
  'En Mantenimiento',
  'Dado de Baja'
] as const;

// Niveles de criticidad
export const CRITICALITY_LEVELS = [
  'Alta',
  'Media',
  'Baja'
] as const;

// Tipos de depreciación
export const DEPRECIATION_TYPES = [
  'Lineal',
  'Acelerada',
  'Sin depreciación'
] as const;

// Claves de almacenamiento local
export const STORAGE_KEYS = {
  USER: 'currentUser',
  USERS: 'users',
  ASSETS: 'assets'
} as const;

// Configuración de alertas
export const ALERT_CONFIG = {
  MAINTENANCE_DAYS: 90,    // Días para alerta de mantenimiento
  WARRANTY_DAYS: 30,       // Días antes de que expire garantía
  DEPRECIATION_THRESHOLD: 0.8  // 80% de depreciación
} as const;

// Constantes de validación
export const VALIDATION = {
  MIN_USERNAME_LENGTH: 4,
  MIN_PASSWORD_LENGTH: 6,
  MIN_ASSET_NAME_LENGTH: 3,
  MIN_PRICE: 0,
  MAX_QUANTITY: 9999
} as const;

// Mensajes de la aplicación
export const MESSAGES = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGIN_ERROR: 'Usuario o contraseña incorrectos',
  REGISTER_SUCCESS: 'Usuario registrado exitosamente',
  REGISTER_ERROR: 'Error al registrar usuario',
  ASSET_CREATED: 'Activo creado exitosamente',
  ASSET_UPDATED: 'Activo actualizado exitosamente',
  ASSET_DELETED: 'Activo eliminado exitosamente',
  REPORT_GENERATED: 'Reporte generado exitosamente',
  REPORT_ERROR: 'Error al generar el reporte',
  CONFIRM_DELETE: '¿Está seguro de eliminar este activo?'
} as const;

// Colores institucionales ULEAM
export const THEME_COLORS = {
  PRIMARY: '#2c5f2d',
  PRIMARY_LIGHT: '#4a8f4b',
  PRIMARY_DARK: '#1a3d1a',
  SECONDARY: '#ffffff',
  ACCENT: '#27ae60',
  DANGER: '#e74c3c',
  WARNING: '#f39c12',
  INFO: '#3498db',
  SUCCESS: '#27ae60'
} as const;
