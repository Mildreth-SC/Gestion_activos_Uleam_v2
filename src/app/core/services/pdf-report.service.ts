import { Injectable } from '@angular/core';
import { Asset } from '../models/asset.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfReportService {

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
   * Genera un reporte PDF de inventario general
   */
  generarReporteInventario(assets: Asset[]): void {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape
    
    // Encabezado
    this.addHeader(doc, 'REPORTE DE INVENTARIO GENERAL');
    this.addDate(doc);

    // Resumen
    const totalValor = assets.reduce((sum, a) => sum + (a.price * a.quantity), 0);
    doc.setFontSize(10);
    doc.text(`Total de Activos: ${assets.length}`, 14, 35);
    doc.text(`Valor Total del Inventario: $${totalValor.toFixed(2)}`, 14, 40);

    // Tabla
    const tableData = assets.map(asset => {
      const depreciation = this.calculateDepreciation(asset);
      return [
        asset.id,
        asset.name,
        asset.type,
        asset.quantity,
        `$${asset.price.toFixed(2)}`,
        `$${(asset.price * asset.quantity).toFixed(2)}`,
        `$${depreciation.currentValue.toFixed(2)}`,
        asset.status,
        asset.responsible,
        asset.location,
        asset.date
      ];
    });

    autoTable(doc, {
      startY: 45,
      head: [['ID', 'Nombre', 'Tipo', 'Cant.', 'Precio Unit.', 'Valor Total', 'Valor Actual', 'Estado', 'Responsable', 'Ubicación', 'Fecha']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [44, 95, 45], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 45 }
    });

    // Guardar
    doc.save(`reporte_inventario_${Date.now()}.pdf`);
  }

  /**
   * Genera un reporte PDF de activos por estado
   */
  generarReportePorEstado(assets: Asset[]): void {
    const doc = new jsPDF();
    
    this.addHeader(doc, 'REPORTE DE ACTIVOS POR ESTADO');
    this.addDate(doc);

    // Agrupar por estado
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

    // Tabla
    const tableData = Array.from(estadosMap.entries()).map(([estado, data]) => [
      estado,
      data.count,
      `$${data.value.toFixed(2)}`,
      `${((data.value / totalValue) * 100).toFixed(2)}%`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Estado', 'Cantidad de Activos', 'Valor Total', 'Porcentaje']],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [44, 95, 45], textColor: 255 },
      foot: [['TOTAL', assets.length.toString(), `$${totalValue.toFixed(2)}`, '100%']],
      footStyles: { fillColor: [220, 220, 220], fontStyle: 'bold' }
    });

    doc.save(`reporte_por_estado_${Date.now()}.pdf`);
  }

  /**
   * Genera un reporte PDF de activos por tipo
   */
  generarReportePorTipo(assets: Asset[]): void {
    const doc = new jsPDF();
    
    this.addHeader(doc, 'REPORTE DE ACTIVOS POR TIPO');
    this.addDate(doc);

    // Agrupar por tipo
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

    // Tabla
    const tableData = Array.from(tiposMap.entries()).map(([tipo, data]) => [
      tipo,
      data.count,
      `$${data.value.toFixed(2)}`,
      `${((data.value / totalValue) * 100).toFixed(2)}%`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Tipo de Activo', 'Cantidad', 'Valor Total', 'Porcentaje']],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [44, 95, 45], textColor: 255 },
      foot: [['TOTAL', assets.length.toString(), `$${totalValue.toFixed(2)}`, '100%']],
      footStyles: { fillColor: [220, 220, 220], fontStyle: 'bold' }
    });

    doc.save(`reporte_por_tipo_${Date.now()}.pdf`);
  }

  /**
   * Genera un reporte PDF de depreciación
   */
  generarReporteDepreciacion(assets: Asset[]): void {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    this.addHeader(doc, 'REPORTE DE DEPRECIACIÓN DE ACTIVOS');
    this.addDate(doc);

    // Tabla
    const tableData = assets.map(asset => {
      const depreciation = this.calculateDepreciation(asset);
      return [
        asset.id,
        asset.name,
        asset.type,
        `$${(asset.price * asset.quantity).toFixed(2)}`,
        depreciation.yearsOfUse,
        `${(depreciation.rate * 100).toFixed(0)}%`,
        `$${depreciation.annual.toFixed(2)}`,
        `$${depreciation.accumulated.toFixed(2)}`,
        `$${depreciation.currentValue.toFixed(2)}`,
        `${((depreciation.accumulated / (asset.price * asset.quantity)) * 100).toFixed(2)}%`
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Nombre', 'Tipo', 'Valor Original', 'Años Uso', 'Tasa %', 'Dep. Anual', 'Dep. Acumulada', 'Valor Actual', '% Depreciado']],
      body: tableData,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [44, 95, 45], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`reporte_depreciacion_${Date.now()}.pdf`);
  }

  /**
   * Genera un reporte PDF individual de un activo
   */
  generarReporteActivo(asset: Asset): void {
    const doc = new jsPDF();
    
    this.addHeader(doc, 'REPORTE INDIVIDUAL DE ACTIVO');
    this.addDate(doc);

    const depreciation = this.calculateDepreciation(asset);

    // Información del activo
    let y = 40;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN GENERAL', 14, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const info = [
      ['ID:', asset.id.toString()],
      ['Nombre:', asset.name],
      ['Tipo:', asset.type],
      ['Cantidad:', asset.quantity.toString()],
      ['Precio Unitario:', `$${asset.price.toFixed(2)}`],
      ['Valor Total Original:', `$${(asset.price * asset.quantity).toFixed(2)}`],
      ['Estado:', asset.status],
      ['Responsable:', asset.responsible],
      ['Ubicación:', asset.location],
      ['Fecha de Compra:', asset.date]
    ];

    info.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 60, y);
      y += 7;
    });

    // Información de depreciación
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('INFORMACIÓN DE DEPRECIACIÓN', 14, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const depInfo = [
      ['Años de Uso:', depreciation.yearsOfUse.toString()],
      ['Tasa de Depreciación Anual:', `${(depreciation.rate * 100).toFixed(0)}%`],
      ['Depreciación Anual:', `$${depreciation.annual.toFixed(2)}`],
      ['Depreciación Mensual:', `$${(depreciation.annual / 12).toFixed(2)}`],
      ['Depreciación Acumulada:', `$${depreciation.accumulated.toFixed(2)}`],
      ['Valor Actual:', `$${depreciation.currentValue.toFixed(2)}`],
      ['Porcentaje Depreciado:', `${((depreciation.accumulated / (asset.price * asset.quantity)) * 100).toFixed(2)}%`]
    ];

    depInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, y);
      y += 7;
    });

    doc.save(`reporte_${asset.name.replace(/\s/g, '_')}_${Date.now()}.pdf`);
  }

  /**
   * Genera un certificado PDF de asignación
   */
  generarCertificadoAsignacion(asset: Asset): void {
    const doc = new jsPDF();
    
    // Encabezado especial para certificado
    doc.setFillColor(44, 95, 45);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICADO DE ASIGNACIÓN DE ACTIVO', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Sistema de Gestión de Activos - ULEAM', 105, 30, { align: 'center' });

    // Fecha de certificación
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const fecha = new Date().toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Fecha de Certificación: ${fecha}`, 105, 50, { align: 'center' });

    // Cuerpo del certificado
    let y = 65;
    doc.setFontSize(11);
    doc.text('Por medio del presente documento se certifica que:', 14, y);
    
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${asset.responsible}`, 105, y, { align: 'center' });
    
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Ha recibido el siguiente activo:', 14, y);

    // Tabla con información del activo
    y += 10;
    autoTable(doc, {
      startY: y,
      body: [
        ['ID del Activo:', asset.id.toString()],
        ['Nombre:', asset.name],
        ['Tipo:', asset.type],
        ['Cantidad:', asset.quantity.toString()],
        ['Valor:', `$${(asset.price * asset.quantity).toFixed(2)}`],
        ['Estado:', asset.status],
        ['Ubicación:', asset.location],
        ['Fecha de Asignación:', asset.date]
      ],
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 110 }
      }
    });

    // Pie del certificado
    y = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text('El activo descrito es responsabilidad del asignado, quien deberá velar por su', 14, y);
    y += 5;
    doc.text('correcto uso, mantenimiento y custodia según las políticas institucionales.', 14, y);

    // Firmas
    y += 25;
    doc.line(30, y, 80, y);
    doc.line(130, y, 180, y);
    y += 5;
    doc.text('Entrega', 55, y, { align: 'center' });
    doc.text('Recibe', 155, y, { align: 'center' });

    doc.save(`certificado_${asset.name.replace(/\s/g, '_')}_${Date.now()}.pdf`);
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
   * Agrega el encabezado al PDF
   */
  private addHeader(doc: jsPDF, title: string): void {
    doc.setFillColor(44, 95, 45);
    doc.rect(0, 0, 300, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 15);
    
    doc.setTextColor(0, 0, 0);
  }

  /**
   * Agrega la fecha actual al PDF
   */
  private addDate(doc: jsPDF): void {
    const fecha = new Date().toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${fecha}`, 14, 30);
    doc.setTextColor(0, 0, 0);
  }
}
