import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Chart, ChartType } from 'chart.js/auto';
import { RespuestasService } from '../../../../data-acces/respuestas.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-respuestas-trivia-app',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './respuestas-trivia-app.component.html',
  styleUrl: './respuestas-trivia-app.component.scss',
})
export class RespuestasTriviaAppComponent implements OnInit {
  selectedYear2: number = new Date().getFullYear();
  availableYears: number[] = [];
  private charts: { [key: string]: Chart | null } = {};

  constructor(private respuestasService: RespuestasService) {}

  ngOnInit() {
    this.cargarTodosLosGraficos();
    this.cargarAniosDisponibles();
    this.cargarGraficoRespuestasTriviaPorAno();
    this.cargarGraficoRespuestasTriviaPorTipoUsuario();
  }

  cargarAniosDisponibles() {
    const currentYear = new Date().getFullYear();
    const startYear = 2018; // Ajusta según tus datos
    this.availableYears = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
  }

  cargarGraficoRespuestasTriviaPorAno() {
    this.respuestasService.obtenerRespuestasTriviaPorAno(this.selectedYear2).subscribe(({ labels, correctas, incorrectas }) => {
      this.generarGraficoMultiEjes('graficoRespuestasTrivia', labels, correctas, incorrectas, `Respuestas Trivia (${this.selectedYear2})`);
    });
  }

  private generarGraficoMultiEjes(id: string, labels: string[], correctas: number[], incorrectas: number[], titulo: string) {
    const ctx = document.getElementById(id) as HTMLCanvasElement;

    if (!ctx) {
      console.error(`Canvas con id "${id}" no encontrado en el DOM.`);
      return;
    }

    if (this.charts[id]) {
      this.charts[id]?.destroy(); // Destruir el gráfico anterior si existe
    }

    const maxCorrectas = Math.max(...correctas);
    const maxIncorrectas = Math.max(...incorrectas);
    const maxValue = Math.max(maxCorrectas, maxIncorrectas);

    this.charts[id] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Respuestas Correctas',
            data: correctas,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            yAxisID: 'y',
          },
          {
            label: 'Respuestas Incorrectas',
            data: incorrectas,
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
            yAxisID: 'y1',
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
            text: titulo,
          },
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            beginAtZero: true,
            suggestedMax: maxValue,
            title: {
              display: true,
              text: 'Correctas',
            },
          },
          y1: {
            type: 'linear',
            position: 'right',
            beginAtZero: true,
            suggestedMax: maxValue,
            grid: {
              drawOnChartArea: false,
            },
            title: {
              display: true,
              text: 'Incorrectas',
            },
          },
        },
      },
    });
  }

  onYearChange() {
    this.cargarGraficoRespuestasTriviaPorAno();
  }

  cargarTodosLosGraficos() {
    this.cargarGraficoPorDia();
    this.cargarGraficoPorSemana();
  }

  cargarGraficoPorDia() {
    this.respuestasService.obtenerRespuestasCorrectasIncorrectasPorDia().subscribe(({ labels, correctas, incorrectas }) => {
      console.log('Datos del día:', { labels, correctas, incorrectas });
      this.generarGraficoMultiEjes('graficoDiaTriviaApp', labels, correctas, incorrectas, 'Respuestas Trivia Hoy');
    });
  }

  cargarGraficoPorSemana() {
    this.respuestasService.obtenerRespuestasCorrectasIncorrectasPorSemana().subscribe(({ labels, correctas, incorrectas }) => {
      console.log('Datos de la semana:', { labels, correctas, incorrectas });
      this.generarGraficoMultiEjes('graficoSemanaTriviaApp', labels, correctas, incorrectas, 'Respuestas Trivia Semana');
    });
  }

  cargarGraficoRespuestasTriviaPorTipoUsuario() {
    this.respuestasService
      .obtenerRespuestasTriviaPorAnoYTipoUsuario(this.selectedYear2)
      .subscribe(({ labels, adultoCorrectas, adultoIncorrectas, ninoCorrectas, ninoIncorrectas }) => {
        const datasets = [
          {
            label: 'Adulto - Correctas',
            data: adultoCorrectas,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            fill: false,
          },
          {
            label: 'Adulto - Incorrectas',
            data: adultoIncorrectas,
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
            fill: false,
          },
          {
            label: 'Niño - Correctas',
            data: ninoCorrectas,
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            fill: false,
          },
          {
            label: 'Niño - Incorrectas',
            data: ninoIncorrectas,
            borderColor: '#FFC107',
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            fill: false,
          },
        ];

        this.generarGrafico('graficoRespuestasTriviaTipo', labels, datasets, `Respuestas Trivia por Tipo (${this.selectedYear2})`);
      });
  }

  private generarGrafico(id: string, labels: string[], datasets: any[], titulo: string) {
    const ctx = document.getElementById(id) as HTMLCanvasElement;

    if (!ctx) {
      console.error(`Canvas con id "${id}" no encontrado en el DOM.`);
      return;
    }

    if (this.charts[id]) {
      this.charts[id]?.destroy(); // Destruir el gráfico anterior si existe
    }

    this.charts[id] = new Chart(ctx, {
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
            text: titulo,
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

  onYearChange2() {
    this.cargarGraficoRespuestasTriviaPorTipoUsuario();
  }
}
