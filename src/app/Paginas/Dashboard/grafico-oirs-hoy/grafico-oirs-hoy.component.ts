import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, ChartType } from 'chart.js/auto';
import { OirsService } from '../../../data-acces/oirs.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-grafico-oirs-hoy',
  standalone: true,
  imports: [],
  templateUrl: './grafico-oirs-hoy.component.html',
  styleUrl: './grafico-oirs-hoy.component.scss'
})
export class GraficoOirsHoyComponent implements OnInit, OnDestroy {
  private chart!: Chart;
  private oirsSubscription!: Subscription;

  // Propiedades para almacenar los conteos de cada tipo de OIRS y el total
  totalOirsHoy: number = 0;
  oirsFelicitacion: number = 0;
  oirsSugerencia: number = 0;
  oirsConsulta: number = 0;
  oirsReclamo: number = 0;

  constructor(private oirsService: OirsService) {}

  ngOnInit(): void {
    this.oirsSubscription = this.oirsService.getOirsHoyPorTipo().subscribe({
      next: data => {
        // Asigna los valores recibidos a las propiedades
        this.oirsFelicitacion = data.felicitacion;
        this.oirsSugerencia = data.sugerencia;
        this.oirsConsulta = data.consulta;
        this.oirsReclamo = data.reclamo;
        this.totalOirsHoy = this.oirsFelicitacion + this.oirsSugerencia + this.oirsConsulta + this.oirsReclamo;

        // Renderiza el gráfico con los datos actualizados
        this.renderChart(data);
      },
      error: error => {
        console.error('Error al obtener los datos de OIRS de hoy:', error);
      }
    });
  }

  private renderChart(data: { sugerencia: number; felicitacion: number; consulta: number; reclamo: number }) {
    if (this.chart) {
      this.chart.destroy(); // Destruir gráfico anterior si existe
    }

    this.chart = new Chart('oirsHoyChart', {
      type: 'bar' as ChartType,
      data: {
        labels: ['Sugerencia', 'Felicitación', 'Consulta', 'Reclamo'],
        datasets: [{
          label: 'OIRS Hoy',
          data: [data.sugerencia, data.felicitacion, data.consulta, data.reclamo],
          backgroundColor: ['#00C1D4', '#4CAF50', '#FFA726', '#F44336']
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.oirsSubscription) {
      this.oirsSubscription.unsubscribe();
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }

}
