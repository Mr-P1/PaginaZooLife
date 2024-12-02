import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js';
import { Animal, PopularidadAnimalService } from '../../../data-acces/popularidadAnimal.service';

@Component({
  selector: 'app-grafico-historial-animal',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './grafico-historial-animal.component.html',
  styleUrl: './grafico-historial-animal.component.scss'
})
export class GraficoHistorialAnimalComponent implements OnInit{

  public idActiva = "";
  private _rutaActiva = inject(ActivatedRoute);
  selectedYear12: number = new Date().getFullYear();
  availableYears: number[] = [];
  private charts: { [key: string]: Chart | null } = {};

  private chart: Chart | null = null;
  animal: Animal | null = null;

  constructor(private popularidadService: PopularidadAnimalService) {}

  ngOnInit() {
    this._rutaActiva.paramMap.subscribe((parametros) => {
      this.idActiva = parametros.get('IdAnimal')!;
      this.cargarAnimal();
    });

    this.cargarAniosDisponibles();
    this.cargarGraficoHistorial();
  }

  cargarAniosDisponibles() {
    const currentYear = new Date().getFullYear();
    const startYear = 2020; // Ajusta según tus datos
    this.availableYears = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
  }

  cargarAnimal() {
    this.popularidadService.obtenerAnimalPorId(this.idActiva).subscribe((animal) => {
      this.animal = animal;
    });
  }

  cargarGraficoHistorial() {
    if (this.chart) {
      this.chart.destroy();
    }

    this.popularidadService.obtenerReaccionesPorAno(this.idActiva, this.selectedYear12).subscribe(({ labels, likes, dislikes }) => {
      const ctx = document.getElementById('animalPopularityChart') as HTMLCanvasElement;

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
              fill: false,
            },
            {
              label: 'Dislikes',
              data: dislikes,
              borderColor: '#F44336',
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
              fill: false,
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
              text: `Popularidad Animal (${this.selectedYear12})`,
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
