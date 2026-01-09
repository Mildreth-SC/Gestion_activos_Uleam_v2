import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetService } from '../../../core/services/asset.service';
import { Asset } from '../../../core/models/asset.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  totalActivos = 0;
  activosNoDisponibles = 0;
  activosDisponibles = 0;
  valorTotal = 0;

  constructor(private assetService: AssetService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngAfterViewInit(): void {
    // Cargar Chart.js dinámicamente
    this.loadChartJS().then(() => {
      this.renderChart();
    });
  }

  loadStatistics(): void {
    const stats = this.assetService.getStatistics();
    this.totalActivos = stats.total;
    this.activosNoDisponibles = stats.noDisponibles;
    this.activosDisponibles = stats.disponibles;
    this.valorTotal = stats.valorTotal;
  }

  renderChart(): void {
    const assets = this.assetService.getAssets();
    
    // Agrupar activos por categoría
    const categoryCounts: { [key: string]: number } = {};
    assets.forEach(asset => {
      categoryCounts[asset.type] = (categoryCounts[asset.type] || 0) + 1;
    });

    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);

    const ctx = document.getElementById('asset-chart') as HTMLCanvasElement;
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              '#667eea',
              '#764ba2',
              '#f093fb',
              '#4facfe',
              '#00f2fe',
              '#43e97b',
              '#38f9d7',
              '#fa709a',
              '#fee140',
              '#30cfd0'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            },
            title: {
              display: false
            }
          }
        }
      });
    }
  }

  private loadChartJS(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof Chart !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }
}
