import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Chart, ChartType } from 'chart.js/auto';
import { RespuestasService } from '../../../data-acces/respuestas.service';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-respuestas-trivia',
  standalone: true,
  imports: [],
  templateUrl: './respuestas-trivia.component.html',
  styleUrl: './respuestas-trivia.component.scss'
})
export class RespuestasTriviaComponent {

  private respuestasSubscription!: Subscription;
  respuestasTotales: number = 0;
  respuestasCorrectas: number = 0;
  respuestasIncorrectas: number = 0;
  promedioCorrectas: number = 0;
  pieChart!: Chart; // Variable para el gráfico de torta (pie chart)


  constructor(private respuestasService: RespuestasService) {}



  ngOnInit() {
    this.cargarTodosLosGraficos();

    this.respuestasSubscription = this.respuestasService.getRespuestasTrivia().subscribe({
      next: (respuestas) => {
        this.respuestasTotales = respuestas.total;
        this.respuestasCorrectas = respuestas.correctas;
        this.respuestasIncorrectas = respuestas.incorrectas;

        if (this.respuestasTotales > 0) {
          this.promedioCorrectas = (this.respuestasCorrectas / this.respuestasTotales) * 100;
        } else {
          this.promedioCorrectas = 0;  // Evitar dividir por 0 si no hay respuestas
        }

        // Llama a la función para renderizar el gráfico después de recibir las respuestas
        this.cargarGraficoPie();
      }
    });



  }

  cargarGraficoPie(): void {
    if (this.pieChart) {
      this.pieChart.destroy(); // Destruir gráfico previo si existe
    }

    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;

    this.pieChart = new Chart(ctx, {
      type: 'doughnut' as ChartType,
      data: {
        labels: ['Correctas', 'Incorrectas'],
        datasets: [{
          data: [this.respuestasCorrectas, this.respuestasIncorrectas],
          backgroundColor: ['#4CAF50', '#F44336'], // Colores para correctas e incorrectas
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right' // Mostrar leyenda a la derecha
          }
        }
      }
    });
  }

  cargarTodosLosGraficos() {
    this.cargarGraficoPorDia();
    this.cargarGraficoPorSemana();
    this.cargarGraficoPorAno();

  }


  cargarGraficoPorDia() {
    this.respuestasService.obtenerRespuestasPorDia().subscribe(({ labels, data }) => {
      this.generarGrafico('graficoDia', 'bar', labels, data, 'Respuestas por Hora (Hoy)');
    });
  }

  cargarGraficoPorSemana() {
    this.respuestasService.obtenerRespuestasPorSemana().subscribe(({ labels, data }) => {
      // Cambiar las etiquetas de los días de la semana (lunes, martes, etc.)
      const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const labelsSemanal = diasSemana.slice(0, labels.length);  // Ajustar los días según los datos recibidos
      this.generarGrafico('graficoSemana', 'bar', labelsSemanal, data, 'Respuestas por Día de la Semana');
    });
  }

  cargarGraficoPorAno() {
    this.respuestasService.obtenerRespuestasPorAno().subscribe(({ labels, data }) => {
      // Cambiar las etiquetas de los meses del año (enero, febrero, etc.)
      const mesesAno = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const labelsAno = mesesAno.slice(0, labels.length);  // Ajustar los meses según los datos recibidos
      this.generarGrafico('graficoAno', 'bar', labelsAno, data, 'Respuestas por Mes');
    });
  }


  private generarGrafico(id: string, tipo: string, labels: string[], data: number[], titulo: string) {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: titulo,
          data,
          backgroundColor: this.obtenerColorSolido(id),
          borderColor: this.obtenerColorSolido(id),
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  private obtenerColorSolido(id: string): string {
    // Colores sólidos para cada gráfico según el ID
    const colores: { [key: string]: string } = {
      'graficoDia': '#4BC0C0',      // Teal
      'graficoSemana': '#FF6384',   // Rosa
      'graficoAno': '#FFCE56'       // Amarillo
    };
    return colores[id] || '#000000'; // Negro por defecto
  }


}
