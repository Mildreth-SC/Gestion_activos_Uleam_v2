import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsvReportService } from '../../../core/services/csv-report.service';
import { PdfReportService } from '../../../core/services/pdf-report.service';
import { AssetService } from '../../../core/services/asset.service';
import { Asset } from '../../../core/models/asset.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  selectedAssetId: string = '';
  reportType: string = '';
  reportFormat: string = 'csv'; // Nuevo: formato del reporte
  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  // Filtros
  filterYear: number | null = null;
  filterLocation: string = '';
  filterName: string = '';
  filterStatus: string = '';
  filterType: string = '';
  startDate: string = '';
  endDate: string = '';

  // Opciones para filtros
  availableYears: number[] = [];
  availableLocations: string[] = [];
  assetStatuses: string[] = ['Disponible', 'No disponible', 'En mantenimiento', 'Dado de baja'];
  assetTypes: string[] = [
    'Edificaciones',
    'Instalaciones, maquinaria, equipos y muebles',
    'Vehículos y equipo caminero',
    'Equipos de cómputo y software',
    'Barcazas y aeronaves',
    'Aviones de fumigación',
    'Otros aviones',
    'Equipo ferroviario',
    'Vehículos de carga',
    'Vehículos eléctricos ligeros',
    'Equipos de Laboratorio'
  ];

  constructor(
    private csvService: CsvReportService,
    private pdfService: PdfReportService,
    private assetService: AssetService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.loadFilterOptions();
  }

  cargarDatos(): void {
    this.assets = this.assetService.getAssets();
    this.filteredAssets = [...this.assets];
  }

  loadFilterOptions(): void {
    this.availableYears = this.assetService.getUniqueYears();
    this.availableLocations = this.assetService.getUniqueLocations();
  }

  applyFilters(): void {
    const filters: any = {};

    if (this.filterYear) filters.year = this.filterYear;
    if (this.filterLocation) filters.location = this.filterLocation;
    if (this.filterName) filters.name = this.filterName;
    if (this.filterStatus) filters.status = this.filterStatus;
    if (this.filterType) filters.type = this.filterType;
    if (this.startDate) filters.startDate = this.startDate;
    if (this.endDate) filters.endDate = this.endDate;

    this.filteredAssets = this.assetService.filterAssets(filters);
  }

  clearFilters(): void {
    this.filterYear = null;
    this.filterLocation = '';
    this.filterName = '';
    this.filterStatus = '';
    this.filterType = '';
    this.startDate = '';
    this.endDate = '';
    this.filteredAssets = [...this.assets];
  }

  generarReporte(): void {
    if (!this.reportType) {
      this.mostrarMensaje('Por favor seleccione un tipo de reporte', 'error');
      return;
    }

    // Aplicar filtros antes de generar el reporte
    this.applyFilters();

    const assetsToReport = this.filteredAssets.length > 0 ? this.filteredAssets : this.assets;

    try {
      switch (this.reportType) {
        case 'inventario':
          this.generarReporteInventario(assetsToReport);
          break;
        case 'estado':
          this.generarReportePorEstado(assetsToReport);
          break;
        case 'tipo':
          this.generarReportePorTipo(assetsToReport);
          break;
        case 'depreciacion':
          this.generarReporteDepreciacion(assetsToReport);
          break;
        case 'disponibles':
          this.generarReporteDisponibles();
          break;
        case 'individual':
          this.generarReporteIndividual();
          break;
        case 'certificado':
          this.generarCertificado();
          break;
        default:
          this.mostrarMensaje('Tipo de reporte no válido', 'error');
      }
    } catch (error) {
      this.mostrarMensaje('Error al generar el reporte', 'error');
      console.error(error);
    }
  }

  generarReporteInventario(assets: Asset[] = this.filteredAssets): void {
    if (assets.length === 0) {
      this.mostrarMensaje('No hay activos para generar el reporte', 'error');
      return;
    }
    
    if (this.reportFormat === 'pdf') {
      this.pdfService.generarReporteInventario(assets);
    } else {
      this.csvService.generarReporteInventario(assets);
    }
    this.mostrarMensaje(`Reporte de inventario generado exitosamente en ${this.reportFormat.toUpperCase()}`, 'success');
  }

  generarReportePorEstado(assets: Asset[] = this.filteredAssets): void {
    if (assets.length === 0) {
      this.mostrarMensaje('No hay activos para generar el reporte', 'error');
      return;
    }
    
    if (this.reportFormat === 'pdf') {
      this.pdfService.generarReportePorEstado(assets);
    } else {
      this.csvService.generarReportePorEstado(assets);
    }
    this.mostrarMensaje(`Reporte por estado generado exitosamente en ${this.reportFormat.toUpperCase()}`, 'success');
  }

  generarReportePorTipo(assets: Asset[] = this.filteredAssets): void {
    if (assets.length === 0) {
      this.mostrarMensaje('No hay activos para generar el reporte', 'error');
      return;
    }
    
    if (this.reportFormat === 'pdf') {
      this.pdfService.generarReportePorTipo(assets);
    } else {
      this.csvService.generarReportePorTipo(assets);
    }
    this.mostrarMensaje(`Reporte por tipo generado exitosamente en ${this.reportFormat.toUpperCase()}`, 'success');
  }

  generarReporteDisponibles(): void {
    const disponibles = this.filteredAssets.filter(a => a.status === 'Disponible');
    if (disponibles.length === 0) {
      this.mostrarMensaje('No hay activos disponibles para generar el reporte', 'error');
      return;
    }
    
    if (this.reportFormat === 'pdf') {
      this.pdfService.generarReporteInventario(disponibles);
    } else {
      this.csvService.generarReporteInventario(disponibles);
    }
    this.mostrarMensaje(`Reporte de activos disponibles generado exitosamente en ${this.reportFormat.toUpperCase()}`, 'success');
  }

  generarReporteDepreciacion(assets: Asset[] = this.filteredAssets): void {
    if (assets.length === 0) {
      this.mostrarMensaje('No hay activos para generar el reporte', 'error');
      return;
    }
    
    if (this.reportFormat === 'pdf') {
      this.pdfService.generarReporteDepreciacion(assets);
    } else {
      this.csvService.generarReporteDepreciacion(assets);
    }
    this.mostrarMensaje(`Reporte de depreciación generado exitosamente en ${this.reportFormat.toUpperCase()}`, 'success');
  }

  generarReporteIndividual(): void {
    if (!this.selectedAssetId) {
      this.mostrarMensaje('Por favor seleccione un activo', 'error');
      return;
    }

    const asset = this.assets.find(a => a.id.toString() === this.selectedAssetId);
    if (!asset) {
      this.mostrarMensaje('Activo no encontrado', 'error');
      return;
    }

    if (this.reportFormat === 'pdf') {
      this.pdfService.generarReporteActivo(asset);
    } else {
      this.csvService.generarReporteActivo(asset);
    }
    this.mostrarMensaje(`Reporte individual generado exitosamente en ${this.reportFormat.toUpperCase()}`, 'success');
  }

  generarCertificado(): void {
    if (!this.selectedAssetId) {
      this.mostrarMensaje('Por favor seleccione un activo', 'error');
      return;
    }

    const asset = this.assets.find(a => a.id.toString() === this.selectedAssetId);
    if (!asset) {
      this.mostrarMensaje('Activo no encontrado', 'error');
      return;
    }

    if (this.reportFormat === 'pdf') {
      this.pdfService.generarCertificadoAsignacion(asset);
    } else {
      this.csvService.generarCertificadoAsignacion(asset);
    }
    this.mostrarMensaje(`Certificado generado exitosamente en ${this.reportFormat.toUpperCase()}`, 'success');
  }

  requiereSeleccionActivo(): boolean {
    return this.reportType === 'individual' || this.reportType === 'certificado';
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.message = mensaje;
    this.messageType = tipo;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 4000);
  }
}
