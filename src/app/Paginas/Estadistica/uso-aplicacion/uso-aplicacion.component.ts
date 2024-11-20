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

  private chart: Chart | undefined;
  dataVisitas: any;
  nivelActual: 'anual' | 'mensual' | 'semanal' | 'diario' = 'anual';
  nivelClave: string | null = null; // Para almacenar el año o mes actual

  ngOnInit() {
    this.cargarTodosLosGraficos();


    this.boletasService.obtenerDatosVisitas().subscribe(data => {
      this.dataVisitas = data;
      this.crearGrafico();
    });

  }

  cargarTodosLosGraficos() {
    this.cargarGraficoPorDia();
    this.cargarGraficoPorSemana();

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



  crearGrafico(): void {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;

    if (this.chart) this.chart.destroy();

    const { labels, dataset } = this.obtenerDatosPorNivel();
    console.log(`Nivel actual: ${this.nivelActual}, Clave de nivel: ${this.nivelClave}`);
    console.log('Etiquetas:', labels, 'Datos:', dataset);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `Usuarios por ${this.nivelActual}`,
          data: dataset,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        onClick: (event, elements) => {
          if (elements.length) {
            const index = elements[0].index;
            this.cambiarNivel(index);
          }
        }
      }
    });
  }

  obtenerDatosPorNivel(): { labels: string[], dataset: number[] } {
    let labels: string[] = [];
    let dataset: number[] = [];
    const nivelData = this.dataVisitas[this.nivelActual];

    if (this.nivelActual === 'anual') {
      labels = Object.keys(nivelData);
      dataset = Object.values(nivelData);
    } else if (this.nivelActual === 'mensual') {
      labels = Object.keys(nivelData).filter(key => key.startsWith(this.nivelClave!));
      dataset = labels.map(key => nivelData[key]);
    } else if (this.nivelActual === 'semanal') {
      labels = Object.keys(nivelData).filter(key => key.startsWith(this.nivelClave!));
      dataset = labels.map(key => nivelData[key]);
    } else if (this.nivelActual === 'diario') {
      labels = Object.keys(nivelData).filter(key => key.startsWith(this.nivelClave!));
      dataset = labels.map(key => nivelData[key]);
    }

    return { labels, dataset };
  }

  cambiarNivel(index: number): void {
    if (this.nivelActual === 'anual') {
      this.nivelActual = 'mensual';
      this.nivelClave = this.chart!.data.labels![index] as string;
    } else if (this.nivelActual === 'mensual') {
      this.nivelActual = 'semanal';
      this.nivelClave = `${this.nivelClave}-W${index + 1}`;
    } else if (this.nivelActual === 'semanal') {
      this.nivelActual = 'diario';
      const day = index + 1;
      this.nivelClave = `${this.nivelClave}-${day}`;
    }

    console.log(`Nuevo nivel: ${this.nivelActual}, Clave de nivel: ${this.nivelClave}`);
    this.crearGrafico();
  }

  retrocederNivel(): void {
    if (this.nivelActual === 'diario') {
      this.nivelActual = 'semanal';
    } else if (this.nivelActual === 'semanal') {
      this.nivelActual = 'mensual';
    } else if (this.nivelActual === 'mensual') {
      this.nivelActual = 'anual';
      this.nivelClave = null; // Restablecer nivel clave para volver al nivel de año
    }
    console.log(`Nivel anterior: ${this.nivelActual}`);
    this.crearGrafico();
  }


}
