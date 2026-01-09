/**
 * Configuración de la aplicación
 * Valores configurables según el ambiente
 */

export const APP_CONFIG = {
  appName: 'Sistema de Gestión de Activos ULEAM',
  appVersion: '1.0.0',
  appDescription: 'Sistema integral para la gestión y control de activos institucionales',
  
  // Información institucional
  institution: {
    name: 'Universidad Laica Eloy Alfaro de Manabí',
    shortName: 'ULEAM',
    logo: '/img/img.png',
    website: 'https://www.uleam.edu.ec',
    address: 'Manta, Manabí, Ecuador'
  },
  
  // Configuración de autenticación
  auth: {
    tokenKey: 'auth_token',
    sessionTimeout: 3600000, // 1 hora en milisegundos
    rememberMeDuration: 604800000 // 7 días en milisegundos
  },
  
  // Configuración de reportes
  reports: {
    defaultFormat: 'XML',
    maxRecords: 1000,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm:ss'
  },
  
  // Configuración de tablas
  table: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100],
    searchDebounceTime: 300 // milisegundos
  },
  
  // Configuración de notificaciones
  notifications: {
    duration: 3000, // milisegundos
    position: 'top-right'
  },
  
  // Configuración de depreciación
  depreciation: {
    defaultMethod: 'Lineal',
    defaultYears: 5,
    minYears: 1,
    maxYears: 20
  }
} as const;

// Tipo inferido de la configuración
export type AppConfig = typeof APP_CONFIG;
