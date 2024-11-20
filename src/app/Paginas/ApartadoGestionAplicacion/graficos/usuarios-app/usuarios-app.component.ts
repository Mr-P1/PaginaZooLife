import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { BoletasService } from '../../../../data-acces/boletas.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios-app',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './usuarios-app.component.html',
  styleUrl: './usuarios-app.component.scss'
})
export class UsuariosAppComponent implements OnInit{
  constructor(private boletasService: BoletasService) {}
  usuariosConBoletas: any[] = [];
  private charts: { [key: string]: Chart | null } = {}; // Almacenar referencias a gráficos
  selectedYear: number = new Date().getFullYear(); // Año seleccionado
  availableYears: number[] = []; // Lista de años disponibles

  private chart: Chart | undefined;

  ngOnInit() {
    console.log('Año seleccionado inicialmente:', this.selectedYear);
    this.cargarAniosDisponibles();
    console.log('Años disponibles:', this.availableYears);
    this.cargarTodosLosGraficos();
  }


  cargarTodosLosGraficos() {
    this.cargarGraficoPorDia();
    this.cargarGraficoPorSemana();
    this.cargarGraficoPorAno();
    this.cargarGraficoUsuariosNuevosPorMes();
  }

  cargarAniosDisponibles() {
    const currentYear = new Date().getFullYear();
    const startYear = 2018; // Año inicial (puedes ajustar según tu base de datos)
    this.availableYears = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
  }

  cargarGraficoPorDia() {
    this.boletasService.obtenerBoletasPorDia().subscribe(({ labels, data }) => {
      this.generarGrafico('graficoDia', 'bar', labels, data, 'Usuarios por Hora (Hoy)');
    });
  }

  cargarGraficoPorSemana() {
    this.boletasService.obtenerBoletasPorSemana().subscribe(({ labels, data }) => {
      // Cambiar las etiquetas de los días de la semana (lunes, martes, etc.)
      const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const labelsSemanal = diasSemana.slice(0, labels.length);  // Ajustar los días según los datos recibidos
      this.generarGrafico('graficoSemana', 'bar', labelsSemanal, data, 'Usuarios por Día de la Semana');
    });
  }

  cargarGraficoPorAno() {
    this.boletasService.obtenerBoletasPorAno(this.selectedYear).subscribe(({ labels, data }) => {
      const mesesAno = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      this.generarGraficoDeLineas("graficoAno",  mesesAno.slice(0, labels.length),data, `Usuarios por Mes (${this.selectedYear})`)
      // this.generarGrafico(
      //   'graficoAno',
      //   'line',
      //   mesesAno.slice(0, labels.length), // Ajustar etiquetas de los meses según datos
      //   data,
      //   `Usuarios por Mes (${this.selectedYear})`
      // );
    });
  }

  onYearChange() {
    this.cargarGraficoPorAno(); // Recarga el gráfico con el año seleccionado
  }



  cargarGraficoUsuariosNuevosPorMes() {
    this.boletasService.obtenerUsuariosNuevosPorMes(this.selectedYear).subscribe(({ labels, data }) => {
      this.generarGraficoDeLineas('graficoUsuariosNuevos', labels, data, `Usuarios Nuevos (${this.selectedYear})`);
    });
  }

  private generarGrafico(id: string, tipo: string, labels: string[], data: number[], titulo: string) {
    const ctx = document.getElementById(id) as HTMLCanvasElement;

    // Destruir cualquier gráfico existente en el mismo canvas
    if (this.charts[id]) {
      this.charts[id]?.destroy();
    }

    // Crear el gráfico y asignarlo a la referencia
    this.charts[id] = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: titulo,
            data,
            backgroundColor: this.obtenerColorSolido(id),
            borderColor: this.obtenerColorSolido(id),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true, // Hace que el gráfico responda al tamaño del contenedor
        plugins: {
          legend: {
            display: true,
            position: 'top', // Posición de la leyenda
          },
        },
        scales: {
          y: {
            beginAtZero: true, // Inicia el eje Y en 0
          },
        },
      },
    });
  }

  private generarGraficoDeLineas(id: string, labels: string[], data: number[], titulo: string) {
    const ctx = document.getElementById(id) as HTMLCanvasElement;

    // Destruir cualquier gráfico existente en el mismo canvas
    if (this.charts[id]) {
      this.charts[id]?.destroy();
    }

    // Crear el gráfico de líneas y asignarlo a la referencia
    this.charts[id] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: titulo,
            data,
            borderColor: '#4BC0C0', // Color de la línea
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Relleno debajo de la línea
            pointStyle: 'circle', // Estilo de los puntos
            pointRadius: 5, // Tamaño de los puntos
            pointHoverRadius: 7, // Tamaño de los puntos al pasar el mouse
            borderWidth: 2, // Grosor de la línea
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },

        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Meses',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad de Usuarios',
            },
          },
        },
      },
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
