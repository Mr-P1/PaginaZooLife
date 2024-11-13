import { Component } from '@angular/core';
import { Chart, ChartType } from 'chart.js/auto';
import { RespuestasService } from '../../../data-acces/respuestas.service';
import { Subscription } from 'rxjs';
import {  DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-respuestas-trivia',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './respuestas-trivia.component.html',
  styleUrl: './respuestas-trivia.component.scss'
})
export class RespuestasTriviaComponent {
  respuestasTotales: number = 0;
  respuestasCorrectas: number = 0;
  respuestasIncorrectas: number = 0;
  respuestasdividido: number = 0;
  promedioCorrectas: number = 0;
  promedioIncorrectas: number = 0;
  tiempoPromedio: number = 0;
  tasaAbandono: number = 0;

  private respuestasSubscription!: Subscription;
  private chart!: Chart;

  constructor(
    private respuestasService: RespuestasService,
  ) {

  }

  ngOnInit() {
    this.respuestasSubscription = this.respuestasService.getRespuestasTrivia().subscribe({
      next: (respuestas) => {
        this.respuestasTotales = respuestas.total;
        this.respuestasCorrectas = respuestas.correctas;
        this.respuestasIncorrectas = respuestas.incorrectas;
        this.tiempoPromedio = respuestas.tiempoPromedio;
        this.tasaAbandono = respuestas.tasaAbandono;

        if (this.respuestasTotales > 0) {
          this.promedioCorrectas = (this.respuestasCorrectas / this.respuestasTotales) * 100;
          this.promedioIncorrectas = (this.respuestasIncorrectas / this.respuestasTotales) * 100;
          this.respuestasdividido = this.respuestasTotales / 10;
        } else {
          this.promedioCorrectas = 0;
          this.promedioIncorrectas = 0;
        }
        this.renderChart();
      },
    });
  }

  renderChart() {
    if (this.chart) {
      this.chart.destroy(); // Destruir gráfico anterior si existe
    }

    this.chart = new Chart('respuestasTriviaChart', {
      type: 'pie' as ChartType,
      data: {
        labels: ['Correctas', 'Incorrectas'],
        datasets: [{
          data: [this.respuestasCorrectas, this.respuestasIncorrectas],
          backgroundColor: ['#4CAF50', '#F44336'], // Colores para correctas e incorrectas
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const value = tooltipItem.raw as number;
                const percentage = ((value / this.respuestasTotales) * 100).toFixed(2);
                return `${tooltipItem.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.respuestasSubscription) {
      this.respuestasSubscription.unsubscribe();
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }

}
