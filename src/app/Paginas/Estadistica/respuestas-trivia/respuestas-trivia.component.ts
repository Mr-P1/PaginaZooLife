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
  pieChart2!: Chart; // Variable para el gráfico de torta (pie chart)
  pieChartGenero!: Chart;


  // respuestasAdulto: number = 0; // Cantidad de respuestas de adultos
  // respuestasNino: number = 0; // Cantidad de respuestas de niños
  respuestasAdultoCorrectas: number = 0;
  respuestasAdultoIncorrectas: number = 0;
  respuestasNinoCorrectas: number = 0;
  respuestasNinoIncorrectas: number = 0;

  respuestasdividido:number = 0;
  promedioCorrectas2: number = 0;
  promedioIncorrectas: number = 0;

  // respuestasMasculino: number = 0;
  // respuestasFemenino: number = 0;
  // respuestasSinDefinir: number = 0;

  constructor(private respuestasService: RespuestasService) {}



  ngOnInit() {
    this.cargarTodosLosGraficos();

    this.cargarGraficoPorTipoYResultado();

    // this.cargarGraficoPorGenero();

    this.respuestasSubscription = this.respuestasService.getRespuestasTrivia().subscribe({
      next: (respuestas) => {
        this.respuestasTotales = respuestas.total;
        this.respuestasCorrectas = respuestas.correctas;
        this.respuestasIncorrectas = respuestas.incorrectas;

        if (this.respuestasTotales > 0) {
          this.promedioCorrectas = (this.respuestasCorrectas / this.respuestasTotales) * 100;
          this.promedioIncorrectas = (this.respuestasIncorrectas / this.respuestasTotales) * 100;
          this.respuestasdividido = this.respuestasTotales / 10
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


  cargarGraficoPorTipoYResultado() {
    this.respuestasService.getRespuestasPorTipoYResultado().subscribe((data) => {
      console.log('Datos recibidos:', data); // Verificar datos
      this.respuestasAdultoCorrectas = data.adultoCorrectas;
      this.respuestasAdultoIncorrectas = data.adultoIncorrectas;
      this.respuestasNinoCorrectas = data.ninoCorrectas;
      this.respuestasNinoIncorrectas = data.ninoIncorrectas;

      this.generarGraficoTipo(
        'graficoTipo',
        'doughnut',
        ['Adulto Correctas', 'Adulto Incorrectas', 'Niño Correctas', 'Niño Incorrectas'],
        [data.adultoCorrectas, data.adultoIncorrectas, data.ninoCorrectas, data.ninoIncorrectas]
      );
    });
  }

  private generarGraficoTipo(id: string, tipo: ChartType, labels: string[], data: number[]) {
    const ctx = document.getElementById(id) as HTMLCanvasElement;

    if (this.pieChart2) {
      this.pieChart2.destroy(); // Destruir gráfico anterior si existe
    }

    this.pieChart2 = new Chart(ctx, {
      type: tipo,
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: ['#36A2EB', '#ff911c', '#4CAF50', '#F44336'],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
        },
      },
    });
  }


  // cargarGraficoPorGenero() {
  //   this.respuestasService.getRespuestasPorGenero().subscribe(({ masculino, femenino, sinDefinir }) => {
  //     // Asignar los valores recibidos a las variables
  //     this.respuestasMasculino = masculino;
  //     this.respuestasFemenino = femenino;
  //     this.respuestasSinDefinir = sinDefinir;

  //     // Llamar al método para generar el gráfico
  //     this.generarGraficoGenero('graficoGenero', 'doughnut',
  //       ['Masculino', 'Femenino', 'Sin definir'],
  //       [masculino, femenino, sinDefinir]
  //     );
  //   });
  // }

  private generarGraficoGenero(id: string, tipo: ChartType, labels: string[], data: number[]) {
    const ctx = document.getElementById(id) as HTMLCanvasElement;

    if (this.pieChartGenero) {
      this.pieChartGenero.destroy(); // Destruir gráfico anterior si existe
    }

    this.pieChartGenero = new Chart(ctx, {
      type: 'doughnut' as ChartType,
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
        },
      },
    });
  }




}
