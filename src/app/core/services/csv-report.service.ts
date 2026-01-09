import { Injectable } from '@angular/core';
import { Asset, AssetType } from '../models/asset.model';

@Injectable({
  providedIn: 'root'
})
export class CsvReportService {

  // Tasas de depreciación por tipo de activo
  private readonly depreciationRates: Record<string, number> = {
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

  constructor() { }

  /**
   * Genera un reporte CSV de todos los activos
   */
  generarReporteInventario(assets: Asset[]): void {
    const headers = [
      'ID',
      'Nombre',
      'Tipo de Activo',
      'Precio Unitario',
      'Cantidad',
      'Valor Total Original',
      'Estado',
      'Responsable',
      'Ubicación',
      'Fecha de Compra',
      'Años de Uso',
      'Tasa Depreciación %',
      'Valor Actual',
      'Depreciación Acumulada'
    ];

    const rows = assets.map(asset => {
      const depreciation = this.calculateDepreciation(asset);
      
      return [
        asset.id,
        this.escapeCsvValue(asset.name),
        this.escapeCsvValue(asset.type),
        asset.price.toFixed(2),
        asset.quantity,
        (asset.price * asset.quantity).toFixed(2),
        this.escapeCsvValue(asset.status),
        this.escapeCsvValue(asset.responsible),
        this.escapeCsvValue(asset.location),
        asset.date,
        depreciation.yearsOfUse,
        (depreciation.rate * 100).toFixed(0) + '%',
        depreciation.currentValue.toFixed(2),
        depreciation.accumulated.toFixed(2)
      ];
    });

    this.downloadCSV(headers, rows, 'reporte_inventario');
  }

  /**
   * Genera un reporte CSV de activos por estado
   */
  generarReportePorEstado(assets: Asset[]): void {
    const headers = [
      'Estado',
      'Cantidad de Activos',
      'Valor Total',
      'Porcentaje'
    ];

    const estadosMap = new Map<string, { count: number; value: number }>();
    let totalValue = 0;

    assets.forEach(asset => {
      const value = asset.price * asset.quantity;
      totalValue += value;

      if (estadosMap.has(asset.status)) {
        const current = estadosMap.get(asset.status)!;
        current.count++;
        current.value += value;
      } else {
        estadosMap.set(asset.status, { count: 1, value });
      }
    });

    const rows = Array.from(estadosMap.entries()).map(([estado, data]) => [
      this.escapeCsvValue(estado),
      data.count,
      data.value.toFixed(2),
      ((data.value / totalValue) * 100).toFixed(2) + '%'
    ]);

    this.downloadCSV(headers, rows, 'reporte_por_estado');
  }

  /**
   * Genera un reporte CSV de activos por tipo
   */
  generarReportePorTipo(assets: Asset[]): void {
    const headers = [
      'Tipo',
      'Cantidad de Activos',
      'Valor Total',
      'Porcentaje'
    ];

    const tiposMap = new Map<string, { count: number; value: number }>();
    let totalValue = 0;

    assets.forEach(asset => {
      const value = asset.price * asset.quantity;
      totalValue += value;

      if (tiposMap.has(asset.type)) {
        const current = tiposMap.get(asset.type)!;
        current.count++;
        current.value += value;
      } else {
        tiposMap.set(asset.type, { count: 1, value });
      }
    });

    const rows = Array.from(tiposMap.entries()).map(([tipo, data]) => [
      this.escapeCsvValue(tipo),
      data.count,
      data.value.toFixed(2),
      ((data.value / totalValue) * 100).toFixed(2) + '%'
    ]);

    this.downloadCSV(headers, rows, 'reporte_por_tipo');
  }

  /**
   * Genera un certificado de asignación en CSV para un activo específico
   */
  generarCertificadoAsignacion(asset: Asset): void {
    const headers = ['Campo', 'Valor'];
    const rows = [
      ['ID', asset.id],
      ['Nombre del Activo', this.escapeCsvValue(asset.name)],
      ['Tipo', this.escapeCsvValue(asset.type)],
      ['Precio Unitario', asset.price],
      ['Cantidad', asset.quantity],
      ['Valor Total', (asset.price * asset.quantity).toFixed(2)],
      ['Estado', this.escapeCsvValue(asset.status)],
      ['Responsable', this.escapeCsvValue(asset.responsible)],
      ['Ubicación', this.escapeCsvValue(asset.location)],
      ['Fecha de Asignación', asset.date],
      ['Fecha de Certificación', new Date().toLocaleDateString('es-EC')]
    ];

    this.downloadCSV(headers, rows, `certificado_${asset.name.replace(/\s/g, '_')}`);
  }

  /**
   * Genera reporte de depreciación en CSV
   */
  generarReporteDepreciacion(assets: Asset[]): void {
    const headers = [
      'ID',
      'Nombre',
      'Tipo de Activo',
      'Precio Original',
      'Cantidad',
      'Valor Total Original',
      'Fecha de Compra',
      'Años de Uso',
      'Tasa Depreciación Anual',
      'Depreciación Anual',
      'Depreciación Acumulada',
      'Valor Actual',
      'Porcentaje Depreciado'
    ];

    const rows = assets.map(asset => {
      const depreciation = this.calculateDepreciation(asset);
      
      return [
        asset.id,
        this.escapeCsvValue(asset.name),
        this.escapeCsvValue(asset.type),
        asset.price.toFixed(2),
        asset.quantity,
        (asset.price * asset.quantity).toFixed(2),
        asset.date,
        depreciation.yearsOfUse,
        (depreciation.rate * 100).toFixed(0) + '%',
        depreciation.annual.toFixed(2),
        depreciation.accumulated.toFixed(2),
        depreciation.currentValue.toFixed(2),
        ((depreciation.accumulated / (asset.price * asset.quantity)) * 100).toFixed(2) + '%'
      ];
    });

    this.downloadCSV(headers, rows, 'reporte_depreciacion');
  }

  /**
   * Genera reporte de activo individual
   */
  generarReporteActivo(asset: Asset): void {
    const headers = ['Campo', 'Valor'];
    const depreciation = this.calculateDepreciation(asset);

    const rows = [
      ['ID', asset.id],
      ['Nombre', this.escapeCsvValue(asset.name)],
      ['Tipo', this.escapeCsvValue(asset.type)],
      ['Precio Unitario', asset.price.toFixed(2)],
      ['Cantidad', asset.quantity],
      ['Valor Total Original', (asset.price * asset.quantity).toFixed(2)],
      ['Estado', this.escapeCsvValue(asset.status)],
      ['Responsable', this.escapeCsvValue(asset.responsible)],
      ['Ubicación', this.escapeCsvValue(asset.location)],
      ['Fecha de Compra', asset.date],
      ['Años de Uso', depreciation.yearsOfUse],
      ['Tasa de Depreciación Anual', (depreciation.rate * 100).toFixed(0) + '%'],
      ['Depreciación Anual', depreciation.annual.toFixed(2)],
      ['Depreciación Mensual', (depreciation.annual / 12).toFixed(2)],
      ['Depreciación Acumulada', depreciation.accumulated.toFixed(2)],
      ['Valor Actual Unitario', (depreciation.currentValue / asset.quantity).toFixed(2)],
      ['Valor Total Actual', depreciation.currentValue.toFixed(2)]
    ];

    this.downloadCSV(headers, rows, `reporte_${asset.name.replace(/\s/g, '_')}`);
  }

  /**
   * Calcula la depreciación de un activo
   */
  private calculateDepreciation(asset: Asset): {
    rate: number;
    annual: number;
    accumulated: number;
    currentValue: number;
    yearsOfUse: number;
  } {
    const purchaseDate = new Date(asset.date);
    const currentDate = new Date();
    const yearsDiff = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const yearsOfUse = Math.floor(yearsDiff);

    const rate = this.depreciationRates[asset.type] || 0.10;
    const originalValue = asset.price * asset.quantity;
    const annualDepreciation = originalValue * rate;
    const accumulatedDepreciation = Math.min(annualDepreciation * yearsOfUse, originalValue);
    const currentValue = Math.max(originalValue - accumulatedDepreciation, 0);

    return {
      rate,
      annual: annualDepreciation,
      accumulated: accumulatedDepreciation,
      currentValue,
      yearsOfUse
    };
  }

  /**
   * Calcula los meses entre dos fechas
   */
  private calcularMesesEntreFechas(fechaInicio: Date, fechaFin: Date): number {
    const years = fechaFin.getFullYear() - fechaInicio.getFullYear();
    const months = fechaFin.getMonth() - fechaInicio.getMonth();
    return years * 12 + months;
  }

  /**
   * Escapa valores para CSV (maneja comas, comillas y saltos de línea)
   */
  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Descarga el archivo CSV
   */
  private downloadCSV(headers: string[], rows: any[][], filename: string): void {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // BOM para UTF-8
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
