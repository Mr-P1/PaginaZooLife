import { Component, OnInit} from '@angular/core';
import { RecompensaService } from '../../../../data-acces/recompensas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Chart } from 'chart.js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recompensas',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './recompensas.component.html',
  styleUrl: './recompensas.component.scss'
})
export class RecompensasComponent implements OnInit{
  recompensas: any[] = [];
  filters = {
    estado: '',
  };
  currentPage: number = 1;
  pageSize: number = 5;
  isLoading: boolean = false;

  selectedYear6: number = new Date().getFullYear();
  availableYears: number[] = [];
  private chart: Chart | null = null;

  constructor(private recompensaService: RecompensaService) {}


  ngOnInit(): void {
    this.initializeYears();
    this.updateRewardsGraph();
    this.aplicarFiltros();
  }

    // Actualiza el gráfico con los datos del año seleccionado
    updateRewardsGraph(): void {
      if (this.chart) {
        this.chart.destroy();
      }

      this.recompensaService.getPremiosPorAno(this.selectedYear6).subscribe(({ labels, data }) => {
        const datasets = Object.keys(data).map((premio) => ({
          label: premio,
          data: data[premio],
          borderColor: this.getRandomColor(),
          borderWidth: 2,
          fill: false,
        }));

        this.renderChart(labels, datasets);
      });
    }

    // Renderiza el gráfico en el canvas
    private renderChart(labels: string[], datasets: any[]): void {
      const ctx = document.getElementById('rewardsChart') as HTMLCanvasElement;

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets,
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: `Premios Canjeados (${this.selectedYear6})`,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Genera un color aleatorio para las líneas del gráfico
    private getRandomColor(): string {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r}, ${g}, ${b})`;
    }


  // Inicializa el rango de años disponibles para el filtro
  private initializeYears(): void {
    const currentYear = new Date().getFullYear();
    const startYear = 2018; // Cambiar según tus datos
    this.availableYears = Array.from(
      { length: currentYear - startYear + 1 },
      (_, i) => startYear + i
    );
  }

  aplicarFiltros(): void {
    this.isLoading = true;
    this.recompensaService
      .getFilteredPremiosUsuario(this.filters.estado)
      .subscribe({
        next: (data) => {
          this.recompensas = data;
          this.currentPage = 1;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar recompensas:', err);
          this.isLoading = false;
        },
      });
  }

  getPaginatedRecompensas(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.recompensas.slice(startIndex, endIndex);
  }

  cambiarPagina(direccion: 'prev' | 'next'): void {
    if (direccion === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    } else if (direccion === 'next' && this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.recompensas.length / this.pageSize);
  }

  reclamarPremio(idPremioUsuario: string): void {
    this.recompensaService.actualizarEstadoPremio(idPremioUsuario).then(() => {
      this.aplicarFiltros();

      // Mostrar SweetAlert de confirmación
      Swal.fire({
        title: '¡Premio Reclamado!',
        text: 'Se ha reclamado un premio exitosamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        backdrop: 'rgba(0, 0, 0, 0.8)',
      });
    }).catch((error) => {
      console.error('Error al reclamar premio:', error);

      // Mostrar SweetAlert de error
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al reclamar el premio. Inténtalo nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        backdrop: 'rgba(0, 0, 0, 0.8)',
      });
    });
  }

}
