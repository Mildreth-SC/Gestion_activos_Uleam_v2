import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Asset, AssetStatus, AssetType } from '../models/asset.model';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private readonly STORAGE_KEY = 'assets';
  private assetsSubject = new BehaviorSubject<Asset[]>([]);
  public assets$ = this.assetsSubject.asObservable();

  constructor() {
    this.loadAssets();
  }

  /**
   * Carga activos desde localStorage
   */
  private loadAssets(): void {
    try {
      const assetsJson = localStorage.getItem(this.STORAGE_KEY);
      if (assetsJson) {
        const assets = JSON.parse(assetsJson) as Asset[];
        this.assetsSubject.next(assets);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      this.assetsSubject.next([]);
    }
  }

  /**
   * Guarda activos en localStorage
   */
  private saveAssets(assets: Asset[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assets));
      this.assetsSubject.next(assets);
    } catch (error) {
      console.error('Error saving assets:', error);
    }
  }

  /**
   * Obtiene todos los activos
   */
  getAssets(): Asset[] {
    return this.assetsSubject.value;
  }

  /**
   * Obtiene un activo por ID
   */
  getAssetById(id: number): Asset | undefined {
    return this.getAssets().find(asset => asset.id === id);
  }

  /**
   * Agrega un nuevo activo
   */
  addAsset(asset: Omit<Asset, 'id'>): Asset {
    const assets = this.getAssets();
    const newId = assets.length > 0 ? Math.max(...assets.map(a => a.id)) + 1 : 1;
    const newAsset: Asset = { ...asset, id: newId };
    this.saveAssets([...assets, newAsset]);
    return newAsset;
  }

  /**
   * Actualiza un activo existente
   */
  updateAsset(id: number, updates: Partial<Asset>): boolean {
    const assets = this.getAssets();
    const index = assets.findIndex(a => a.id === id);
    
    if (index === -1) {
      return false;
    }

    assets[index] = { ...assets[index], ...updates };
    this.saveAssets(assets);
    return true;
  }

  /**
   * Elimina un activo
   */
  deleteAsset(id: number): boolean {
    const assets = this.getAssets();
    const filtered = assets.filter(a => a.id !== id);
    
    if (filtered.length === assets.length) {
      return false;
    }

    this.saveAssets(filtered);
    return true;
  }

  /**
   * Filtra activos por estado
   */
  getAssetsByStatus(status: AssetStatus): Asset[] {
    return this.getAssets().filter(asset => asset.status === status);
  }

  /**
   * Filtra activos por tipo
   */
  getAssetsByType(type: AssetType): Asset[] {
    return this.getAssets().filter(asset => asset.type === type);
  }

  /**
   * Obtiene el valor total del inventario
   */
  getTotalInventoryValue(): number {
    return this.getAssets().reduce((sum, asset) => 
      sum + (asset.price * asset.quantity), 0
    );
  }

  /**
   * Obtiene estadísticas generales
   */
  getStatistics() {
    const assets = this.getAssets();
    return {
      total: assets.length,
      noDisponibles: assets.filter(a => a.status === 'No disponible').length,
      disponibles: assets.filter(a => a.status === 'Disponible').length,
      enMantenimiento: assets.filter(a => a.status === 'En mantenimiento').length,
      valorTotal: this.getTotalInventoryValue()
    };
  }

  /**
   * Busca activos por término
   */
  searchAssets(searchTerm: string): Asset[] {
    const term = searchTerm.toLowerCase();
    return this.getAssets().filter(asset =>
      asset.name.toLowerCase().includes(term) ||
      asset.responsible.toLowerCase().includes(term) ||
      asset.location.toLowerCase().includes(term)
    );
  }

  /**
   * Calcula la depreciación de un activo
   */
  calculateDepreciation(asset: Asset): any {
    const depreciationRates: Record<string, number> = {
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

    const purchaseDate = new Date(asset.date);
    const currentDate = new Date();
    const yearsDiff = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const yearsOfUse = Math.floor(yearsDiff);

    const rate = depreciationRates[asset.type] || 0.10;
    const originalValue = asset.price * asset.quantity;
    const annualDepreciation = originalValue * rate;
    const accumulatedDepreciation = Math.min(annualDepreciation * yearsOfUse, originalValue);
    const currentValue = Math.max(originalValue - accumulatedDepreciation, 0);

    return {
      anual: annualDepreciation,
      mensual: annualDepreciation / 12,
      acumulada: accumulatedDepreciation,
      valorActual: currentValue,
      porcentaje: rate * 100,
      anosUso: yearsOfUse
    };
  }

  /**
   * Obtiene activos con información de depreciación calculada
   */
  getAssetsWithDepreciation(): any[] {
    return this.getAssets().map(asset => ({
      ...asset,
      depreciation: this.calculateDepreciation(asset)
    }));
  }

  /**
   * Filtra activos con múltiples criterios para reportes
   */
  filterAssets(filters: {
    year?: number;
    location?: string;
    name?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Asset[] {
    let filtered = this.getAssets();

    if (filters.year) {
      filtered = filtered.filter(asset => {
        const assetYear = new Date(asset.date).getFullYear();
        return assetYear === filters.year;
      });
    }

    if (filters.location) {
      filtered = filtered.filter(asset =>
        asset.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.name) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(asset => asset.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter(asset => asset.type === filters.type);
    }

    if (filters.startDate) {
      filtered = filtered.filter(asset => asset.date >= filters.startDate!);
    }

    if (filters.endDate) {
      filtered = filtered.filter(asset => asset.date <= filters.endDate!);
    }

    return filtered;
  }

  /**
   * Obtiene años únicos de compra de activos
   */
  getUniqueYears(): number[] {
    const years = this.getAssets().map(asset => new Date(asset.date).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }

  /**
   * Obtiene ubicaciones únicas
   */
  getUniqueLocations(): string[] {
    const locations = this.getAssets().map(asset => asset.location);
    return [...new Set(locations)].sort();
  }
}
