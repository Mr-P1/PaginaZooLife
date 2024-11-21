import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js';
import { Planta, PopularidadPlantaService } from '../../../data-acces/popularidadPlanta.service';

@Component({
  selector: 'app-grafico-historial-planta',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './grafico-historial-planta.component.html',
  styleUrl: './grafico-historial-planta.component.scss'
})
export class GraficoHistorialPlantaComponent implements OnInit {
  public idActiva = '';
  private _rutaActiva = inject(ActivatedRoute);
  selectedYear13: number = new Date().getFullYear();
  availableYears: number[] = [];
  private chart: Chart | null = null;
  planta: Planta | null = null;

  constructor(private popularidadService: PopularidadPlantaService) {}

  ngOnInit() {
    this._rutaActiva.paramMap.subscribe((parametros) => {
      this.idActiva = parametros.get('IdPlanta')!;
      this.cargarPlanta();
    });

    this.cargarAniosDisponibles();
    this.cargarGraficoHistorial();
  }

  cargarAniosDisponibles() {
    const currentYear = new Date().getFullYear();
    const startYear = 2018; // Ajusta según tus datos
    this.availableYears = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
  }

  cargarPlanta() {
    this.popularidadService.obtenerPlantaPorId(this.idActiva).subscribe((planta) => {
      this.planta = planta;
    });
  }

  cargarGraficoHistorial() {
    if (this.chart) {
      this.chart.destroy();
    }

    this.popularidadService
      .obtenerReaccionesPlantaPorAno(this.idActiva, this.selectedYear13)
      .subscribe(({ labels, likes, dislikes }) => {
        const ctx = document.getElementById('plantaPopularityChart') as HTMLCanvasElement;

        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Likes',
                data: likes,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true,
              },
              {
                label: 'Dislikes',
                data: dislikes,
                borderColor: '#F44336',
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: `Popularidad Planta (${this.selectedYear13})`,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      });
  }
}
