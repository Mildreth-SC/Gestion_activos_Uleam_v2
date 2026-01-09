export const environment = {
  production: false,
  appName: 'Sistema de Gestión de Activos ULEAM',
  version: '1.0.0',
  
  // Configuración de la institución
  institucion: {
    nombre: 'Universidad Laica Eloy Alfaro de Manabí',
    siglas: 'ULEAM',
    responsableInventario: {
      nombre: 'Dr. Carlos Mendoza',
      cargo: 'Director Administrativo'
    }
  },
  
  // Configuración de vida útil de activos (años)
  vidaUtil: {
    'Equipos de cómputo y software': 5,
    'Instalaciones, maquinaria, equipos y muebles': 10,
    'Vehículos': 7,
    'Edificios': 20,
    'default': 5
  },
  
  // Configuración de criticidad
  criticidad: {
    alta: 500,    // Valor mayor a este monto = Alta
    media: 100    // Valor mayor a este monto = Media, menor = Baja
  },
  
  // Configuración de alertas
  alertas: {
    depreciacionMedia: 50,  // % para alerta media
    depreciacionAlta: 80,   // % para alerta alta
    valorAltoSinAsignar: 1000  // $ para alerta de valor alto
  }
};
