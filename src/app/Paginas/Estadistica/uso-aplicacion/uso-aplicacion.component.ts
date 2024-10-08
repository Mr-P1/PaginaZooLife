import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { BoletasService } from '../../../data-acces/boletas.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-uso-aplicacion',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './uso-aplicacion.component.html',
  styleUrls: ['./uso-aplicacion.component.scss']
})
export class UsoAplicacionComponent implements OnInit {
  constructor(private boletasService: BoletasService) {}
  usuariosConBoletas: any[] = [];

  ngOnInit() {
    this.cargarTodosLosGraficos();

    this.cargarUsuariosConBoletas();


  }

  cargarTodosLosGraficos() {
    this.cargarGraficoPorDia();
    this.cargarGraficoPorSemana();
    this.cargarGraficoPorAno();
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
    this.boletasService.obtenerBoletasPorAno().subscribe(({ labels, data }) => {
      // Cambiar las etiquetas de los meses del año (enero, febrero, etc.)
      const mesesAno = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const labelsAno = mesesAno.slice(0, labels.length);  // Ajustar los meses según los datos recibidos
      this.generarGrafico('graficoAno', 'bar', labelsAno, data, 'Usuarios por Mes');
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

  cargarUsuariosConBoletas() {
    this.boletasService.obtenerUsuariosConBoletas().subscribe(usuarios => {
      this.usuariosConBoletas = usuarios;
    });
  }




}
