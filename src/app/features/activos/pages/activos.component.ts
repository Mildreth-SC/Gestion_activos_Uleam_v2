import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../../core/services/asset.service';
import { Asset, AssetType, AssetStatus } from '../../../core/models/asset.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-activos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './activos.component.html',
  styleUrls: ['./activos.component.css']
})
export class ActivosComponent implements OnInit {
  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  
  // Modal
  showModal = false;
  modalTitle = 'Añadir Activo';
  editingAsset: Asset | null = null;
  
  // Filtros
  searchTerm = '';
  selectedType = '';
  
  // Formulario
  assetForm: Partial<Asset> = this.getEmptyForm();
  
  // Tipos de activos con sus tasas de depreciación
  assetTypes: AssetType[] = [
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
  
  // Estados
  assetStatuses: AssetStatus[] = ['Disponible', 'No disponible', 'En mantenimiento', 'Dado de baja'];

  // Tasas de depreciación
  depreciationRates: Record<string, number> = {
    'Edificaciones': 5,
    'Instalaciones, maquinaria, equipos y muebles': 10,
    'Vehículos y equipo caminero': 20,
    'Equipos de cómputo y software': 33,
    'Barcazas y aeronaves': 5,
    'Aviones de fumigación': 25,
    'Otros aviones': 10,
    'Equipo ferroviario': 6,
    'Vehículos de carga': 25,
    'Vehículos eléctricos ligeros': 25,
    'Equipos de Laboratorio': 10
  };

  constructor(private assetService: AssetService) {}

  ngOnInit(): void {
    this.loadAssets();
    this.assetService.assets$.subscribe(() => {
      this.loadAssets();
    });
  }

  loadAssets(): void {
    this.assets = this.assetService.getAssets();
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.assets];

    // Filtro de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(term) ||
        asset.responsible.toLowerCase().includes(term) ||
        asset.location.toLowerCase().includes(term)
      );
    }

    // Filtro por tipo
    if (this.selectedType) {
      filtered = filtered.filter(asset => asset.type === this.selectedType);
    }

    this.filteredAssets = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onTypeFilterChange(): void {
    this.applyFilters();
  }

  openAddModal(): void {
    this.editingAsset = null;
    this.modalTitle = 'Añadir Activo';
    this.assetForm = this.getEmptyForm();
    this.showModal = true;
  }

  openEditModal(asset: Asset): void {
    this.editingAsset = asset;
    this.modalTitle = 'Editar Activo';
    this.assetForm = { ...asset };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingAsset = null;
    this.assetForm = this.getEmptyForm();
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.editingAsset) {
      // Actualizar
      this.assetService.updateAsset(this.editingAsset.id, this.assetForm as Partial<Asset>);
      alert('Activo actualizado exitosamente');
    } else {
      // Crear nuevo
      this.assetService.addAsset(this.assetForm as Omit<Asset, 'id'>);
      alert('Activo agregado exitosamente');
    }

    this.closeModal();
  }

  deleteAsset(id: number): void {
    if (confirm('¿Está seguro de eliminar este activo?')) {
      this.assetService.deleteAsset(id);
      alert('Activo eliminado exitosamente');
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.assetForm.name &&
      this.assetForm.type &&
      this.assetForm.price &&
      this.assetForm.quantity &&
      this.assetForm.status &&
      this.assetForm.responsible &&
      this.assetForm.location &&
      this.assetForm.date
    );
  }

  private getEmptyForm(): Partial<Asset> {
    return {
      name: '',
      type: 'Equipos de cómputo y software',
      price: 0,
      quantity: 1,
      status: 'Disponible',
      responsible: '',
      location: '',
      date: new Date().toISOString().split('T')[0]
    };
  }

  getTotalValue(asset: Asset): number {
    return asset.price * asset.quantity;
  }

  getDepreciation(asset: Asset): any {
    return this.assetService.calculateDepreciation(asset);
  }

  getDepreciationRate(type: AssetType): number {
    return this.depreciationRates[type] || 10;
  }

  getYearsOfUse(asset: Asset): number {
    const purchaseDate = new Date(asset.date);
    const currentDate = new Date();
    const yearsDiff = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(yearsDiff);
  }

  getCurrentValue(asset: Asset): number {
    const depreciation = this.getDepreciation(asset);
    return depreciation.valorActual;
  }

  formatCurrency(value: number): string {
    return '$' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
