import { Injectable } from '@angular/core';
import { AssetService } from './asset.service';
import { 
  Asset, 
  AuditInfo, 
  ResumenGeneral, 
  Depreciation, 
  Alert, 
  Criticality,
  AlertPriority 
} from '../models/asset.model';

/**
 * Servicio Angular especializado en XML para Auditorías y Control de Activos
 */
@Injectable({
  providedIn: 'root'
})
export class XmlAuditoriaService {

  constructor(private assetService: AssetService) {}

  /**
   * Genera reporte de auditoría completo en formato XML
   */
  generarReporteAuditoria(): string {
    const assets = this.assetService.getAssets();
    const fechaActual = new Date();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<auditoriaActivos>\n';
    
    // Información de auditoría
    xml += '  <informacionAuditoria>\n';
    xml += `    <numeroAuditoria>AUD-${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}</numeroAuditoria>\n`;
    xml += `    <fechaAuditoria>${this.formatDate(fechaActual)}</fechaAuditoria>\n`;
    xml += `    <auditor>Sistema Automático ULEAM</auditor>\n`;
    xml += '    <periodo>\n';
    xml += `      <inicio>${this.getPeriodoInicio()}</inicio>\n`;
    xml += `      <fin>${this.formatDate(fechaActual)}</fin>\n`;
    xml += '    </periodo>\n';
    xml += '  </informacionAuditoria>\n';
    
    // Resumen general con cálculos
    const resumen = this.calcularResumenGeneral(assets);
    xml += '  <resumenGeneral>\n';
    xml += `    <totalActivos>${resumen.totalActivos}</totalActivos>\n`;
    xml += `    <valorTotalInventario>${resumen.valorTotalInventario.toFixed(2)}</valorTotalInventario>\n`;
    xml += `    <activosAsignados>${resumen.activosAsignados}</activosAsignados>\n`;
    xml += `    <activosDisponibles>${resumen.activosDisponibles}</activosDisponibles>\n`;
    xml += `    <depreciacionEstimada>${resumen.depreciacionEstimada.toFixed(2)}</depreciacionEstimada>\n`;
    xml += '  </resumenGeneral>\n';
    
    // Activos detallados
    xml += '  <activos>\n';
    assets.forEach((asset, index) => {
      const criticidad = this.calcularCriticidad(asset);
      const vidaUtil = this.calcularVidaUtil(asset.type);
      const depreciacion = this.calcularDepreciacion(asset, vidaUtil);
      
      xml += `    <activo id="${asset.id}" criticidad="${criticidad}">\n`;
      xml += `      <codigoPatrimonial>PAT-${asset.date.substring(0, 4)}-${String(index + 1).padStart(3, '0')}</codigoPatrimonial>\n`;
      xml += `      <descripcion><![CDATA[${asset.name}]]></descripcion>\n`;
      xml += `      <categoria><![CDATA[${asset.type}]]></categoria>\n`;
      xml += '      <asignacion>\n';
      xml += `        <responsable><![CDATA[${asset.responsible}]]></responsable>\n`;
      xml += `        <ubicacion><![CDATA[${asset.location}]]></ubicacion>\n`;
      xml += `        <fechaAsignacion>${asset.date}</fechaAsignacion>\n`;
      xml += '      </asignacion>\n';
      xml += '      <valoracion>\n';
      xml += `        <cantidad>${asset.quantity}</cantidad>\n`;
      xml += `        <valorUnitario>${asset.price.toFixed(2)}</valorUnitario>\n`;
      xml += `        <valorTotal>${(asset.price * asset.quantity).toFixed(2)}</valorTotal>\n`;
      xml += `        <vidaUtil>${vidaUtil} años</vidaUtil>\n`;
      xml += `        <depreciacionMensual>${depreciacion.mensual.toFixed(2)}</depreciacionMensual>\n`;
      xml += `        <valorActual>${depreciacion.valorActual.toFixed(2)}</valorActual>\n`;
      xml += '      </valoracion>\n';
      xml += `      <estadoFisico>${this.determinarEstadoFisico(depreciacion)}</estadoFisico>\n`;
      xml += '    </activo>\n';
    });
    xml += '  </activos>\n';
    
    // Alertas
    xml += '  <alertas>\n';
    assets.forEach(asset => {
      const alertas = this.generarAlertas(asset);
      alertas.forEach(alerta => {
        xml += `    <alerta tipo="${alerta.tipo}" prioridad="${alerta.prioridad}">\n`;
        xml += `      <activo>${asset.id}</activo>\n`;
        xml += `      <mensaje><![CDATA[${alerta.mensaje}]]></mensaje>\n`;
        xml += `      <fechaEmision>${this.formatDate(new Date())}</fechaEmision>\n`;
        xml += '    </alerta>\n';
      });
    });
    xml += '  </alertas>\n';
    
    // Firmas
    xml += this.generarSeccionFirmas();
    xml += '</auditoriaActivos>';
    
    return xml;
  }

  /**
   * Genera certificado de asignación de activo
   */
  generarCertificadoAsignacion(assetId: number): string | null {
    const asset = this.assetService.getAssetById(assetId);
    
    if (!asset) {
      return null;
    }
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<certificadoAsignacion>\n';
    xml += `  <numeroCertificado>CERT-${Date.now()}</numeroCertificado>\n`;
    xml += `  <fechaEmision>${this.formatDateLocale(new Date())}</fechaEmision>\n`;
    xml += '  <institucion>\n';
    xml += '    <nombre>Universidad Laica Eloy Alfaro de Manabí</nombre>\n';
    xml += '    <siglas>ULEAM</siglas>\n';
    xml += '  </institucion>\n';
    xml += '  <activoAsignado>\n';
    xml += `    <codigo>${asset.id}</codigo>\n`;
    xml += `    <descripcion><![CDATA[${asset.name}]]></descripcion>\n`;
    xml += `    <valorDeclarado>$${(asset.price * asset.quantity).toFixed(2)}</valorDeclarado>\n`;
    xml += '  </activoAsignado>\n';
    xml += '  <responsable>\n';
    xml += `    <nombre><![CDATA[${asset.responsible}]]></nombre>\n`;
    xml += `    <ubicacion><![CDATA[${asset.location}]]></ubicacion>\n`;
    xml += '    <responsabilidades>\n';
    xml += '      <responsabilidad>Uso adecuado del activo</responsabilidad>\n';
    xml += '      <responsabilidad>Custodia y conservación</responsabilidad>\n';
    xml += '      <responsabilidad>Notificar cualquier daño o pérdida</responsabilidad>\n';
    xml += '    </responsabilidades>\n';
    xml += '  </responsable>\n';
    xml += '</certificadoAsignacion>';
    
    return xml;
  }

  /**
   * Genera reporte de depreciación
   */
  generarReporteDepreciacion(): string {
    const assets = this.assetService.getAssets();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<reporteDepreciacion>\n';
    xml += `  <periodoFiscal>${new Date().getFullYear()}</periodoFiscal>\n`;
    xml += `  <fechaGeneracion>${this.formatDate(new Date())}</fechaGeneracion>\n`;
    
    let totalDepreciacion = 0;
    
    xml += '  <activos>\n';
    assets.forEach(asset => {
      const vidaUtil = this.calcularVidaUtil(asset.type);
      const depreciacion = this.calcularDepreciacion(asset, vidaUtil);
      totalDepreciacion += depreciacion.acumulada;
      
      xml += '    <activo>\n';
      xml += `      <codigo>${asset.id}</codigo>\n`;
      xml += `      <descripcion><![CDATA[${asset.name}]]></descripcion>\n`;
      xml += `      <valorOriginal>${(asset.price * asset.quantity).toFixed(2)}</valorOriginal>\n`;
      xml += `      <vidaUtil>${vidaUtil}</vidaUtil>\n`;
      xml += `      <depreciacionAnual>${depreciacion.anual.toFixed(2)}</depreciacionAnual>\n`;
      xml += `      <depreciacionAcumulada>${depreciacion.acumulada.toFixed(2)}</depreciacionAcumulada>\n`;
      xml += `      <valorEnLibros>${depreciacion.valorActual.toFixed(2)}</valorEnLibros>\n`;
      xml += `      <porcentajeDepreciacion>${depreciacion.porcentaje.toFixed(2)}%</porcentajeDepreciacion>\n`;
      xml += '    </activo>\n';
    });
    xml += '  </activos>\n';
    xml += `  <totalDepreciacionAcumulada>${totalDepreciacion.toFixed(2)}</totalDepreciacionAcumulada>\n`;
    xml += '</reporteDepreciacion>';
    
    return xml;
  }

  /**
   * Genera historial de movimientos
   */
  generarHistorialMovimientos(): string {
    const assets = this.assetService.getAssets();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<historialMovimientos>\n';
    xml += `  <fechaGeneracion>${new Date().toISOString()}</fechaGeneracion>\n`;
    xml += '  <movimientos>\n';
    
    assets.forEach(asset => {
      xml += '    <movimiento>\n';
      xml += `      <tipoMovimiento>Asignación Inicial</tipoMovimiento>\n`;
      xml += `      <fecha>${asset.date}</fecha>\n`;
      xml += `      <activo><![CDATA[${asset.name}]]></activo>\n`;
      xml += `      <destino><![CDATA[${asset.location}]]></destino>\n`;
      xml += `      <responsable><![CDATA[${asset.responsible}]]></responsable>\n`;
      xml += `      <estado>${asset.status}</estado>\n`;
      xml += '    </movimiento>\n';
    });
    
    xml += '  </movimientos>\n';
    xml += '</historialMovimientos>';
    
    return xml;
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Calcula la criticidad del activo según su valor
   */
  private calcularCriticidad(asset: Asset): Criticality {
    if (asset.price > 500) return 'Alta';
    if (asset.price > 100) return 'Media';
    return 'Baja';
  }

  /**
   * Calcula la vida útil según el tipo de activo
   */
  private calcularVidaUtil(tipo: string): number {
    const vidasUtiles: Record<string, number> = {
      'Equipos de cómputo y software': 5,
      'Instalaciones, maquinaria, equipos y muebles': 10,
      'Vehículos': 7,
      'Edificios': 20
    };
    return vidasUtiles[tipo] || 5;
  }

  /**
   * Calcula la depreciación del activo (método lineal mejorado)
   */
  private calcularDepreciacion(asset: Asset, vidaUtil: number): Depreciation {
    const valorTotal = asset.price * asset.quantity;
    const fechaAdquisicion = new Date(asset.date);
    const fechaActual = new Date();
    
    // Cálculo preciso de meses transcurridos
    const mesesTranscurridos = this.calcularMesesEntreFechas(fechaAdquisicion, fechaActual);
    
    const depreciacionAnual = valorTotal / vidaUtil;
    const depreciacionMensual = depreciacionAnual / 12;
    const depreciacionAcumulada = Math.min(depreciacionMensual * mesesTranscurridos, valorTotal);
    const valorActual = Math.max(valorTotal - depreciacionAcumulada, 0);
    const porcentaje = (depreciacionAcumulada / valorTotal) * 100;
    
    return {
      anual: depreciacionAnual,
      mensual: depreciacionMensual,
      acumulada: depreciacionAcumulada,
      valorActual: valorActual,
      porcentaje: porcentaje
    };
  }

  /**
   * Calcula meses entre dos fechas de forma precisa
   */
  private calcularMesesEntreFechas(fechaInicio: Date, fechaFin: Date): number {
    const años = fechaFin.getFullYear() - fechaInicio.getFullYear();
    const meses = fechaFin.getMonth() - fechaInicio.getMonth();
    return años * 12 + meses;
  }

  /**
   * Genera alertas basadas en el estado del activo
   */
  private generarAlertas(asset: Asset): Alert[] {
    const alertas: Alert[] = [];
    const vidaUtil = this.calcularVidaUtil(asset.type);
    const depreciacion = this.calcularDepreciacion(asset, vidaUtil);
    
    // Alerta por depreciación
    if (depreciacion.porcentaje > 50) {
      alertas.push({
        tipo: 'Depreciación',
        prioridad: depreciacion.porcentaje > 80 ? 'Alta' : 'Media',
        mensaje: `Activo ha alcanzado ${depreciacion.porcentaje.toFixed(0)}% de depreciación`,
        activoId: asset.id
      });
    }

    // Alerta por valor alto y disponible
    if (asset.price > 1000 && asset.status === 'Disponible') {
      alertas.push({
        tipo: 'Valor',
        prioridad: 'Media',
        mensaje: `Activo de alto valor sin asignar`,
        activoId: asset.id
      });
    }
    
    return alertas;
  }

  /**
   * Calcula el resumen general del inventario
   */
  private calcularResumenGeneral(assets: Asset[]): ResumenGeneral {
    const totalActivos = assets.length;
    const valorTotal = assets.reduce((sum, a) => sum + (a.price * a.quantity), 0);
    const asignados = assets.filter(a => a.status === 'Asignado').length;
    const disponibles = assets.filter(a => a.status === 'Disponible').length;
    
    // Calcular depreciación total estimada
    let depreciacionTotal = 0;
    assets.forEach(asset => {
      const vidaUtil = this.calcularVidaUtil(asset.type);
      const depreciacion = this.calcularDepreciacion(asset, vidaUtil);
      depreciacionTotal += depreciacion.acumulada;
    });
    
    return {
      totalActivos,
      valorTotalInventario: valorTotal,
      activosAsignados: asignados,
      activosDisponibles: disponibles,
      depreciacionEstimada: depreciacionTotal
    };
  }

  /**
   * Determina el estado físico basado en la depreciación
   */
  private determinarEstadoFisico(depreciacion: Depreciation): string {
    if (depreciacion.porcentaje > 80) return 'Regular';
    if (depreciacion.porcentaje > 50) return 'Bueno';
    return 'Excelente';
  }

  /**
   * Genera la sección de firmas
   */
  private generarSeccionFirmas(): string {
    let xml = '  <firmas>\n';
    xml += '    <responsableInventario>\n';
    xml += '      <nombre>Dr. Carlos Mendoza</nombre>\n';
    xml += '      <cargo>Director Administrativo</cargo>\n';
    xml += `      <fecha>${this.formatDate(new Date())}</fecha>\n`;
    xml += '    </responsableInventario>\n';
    xml += '  </firmas>\n';
    return xml;
  }

  /**
   * Obtiene la fecha de inicio del período
   */
  private getPeriodoInicio(): string {
    const assets = this.assetService.getAssets();
    if (assets.length === 0) {
      return new Date().getFullYear() + '-01-01';
    }
    const fechasMasAntiguas = assets
      .map(a => new Date(a.date))
      .sort((a, b) => a.getTime() - b.getTime());
    return this.formatDate(fechasMasAntiguas[0]);
  }

  /**
   * Formatea fecha a YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Formatea fecha a formato local
   */
  private formatDateLocale(date: Date): string {
    return date.toLocaleDateString('es-EC');
  }

  /**
   * Descarga el XML generado
   */
  downloadXML(xmlContent: string, filename: string): void {
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Genera y descarga reporte de auditoría
   */
  generarYDescargarAuditoria(): void {
    const xml = this.generarReporteAuditoria();
    this.downloadXML(xml, `auditoria_${this.formatDate(new Date())}.xml`);
  }

  /**
   * Genera y descarga certificado de asignación
   */
  generarYDescargarCertificado(assetId: number): boolean {
    const xml = this.generarCertificadoAsignacion(assetId);
    if (xml) {
      this.downloadXML(xml, `certificado_${assetId}.xml`);
      return true;
    }
    return false;
  }

  /**
   * Genera y descarga reporte de depreciación
   */
  generarYDescargarDepreciacion(): void {
    const xml = this.generarReporteDepreciacion();
    this.downloadXML(xml, `depreciacion_${new Date().getFullYear()}.xml`);
  }

  /**
   * Genera y descarga historial de movimientos
   */
  generarYDescargarHistorial(): void {
    const xml = this.generarHistorialMovimientos();
    this.downloadXML(xml, `historial_${this.formatDate(new Date())}.xml`);
  }
}
