import { Component, OnInit,OnDestroy } from '@angular/core';
import { estadisticaService } from '../estadisitca.service';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Chart, ChartType } from 'chart.js';

@Component({
  selector: 'app-escaneo-areas-hoy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './escaneo-areas-hoy.component.html',
  styleUrl: './escaneo-areas-hoy.component.scss'
})
export class EscaneoAreasHoyComponent implements OnInit, OnDestroy{
  areasVisitadasSemana$!: Observable<{ area: string; countQR: number; countOtros: number }[]>;
  private subscription!: Subscription;
  private chart!: Chart;

  constructor(private estadisticaService: estadisticaService) {}

  ngOnInit(): void {
    this.areasVisitadasSemana$ = this.estadisticaService.getAreasMasVisitadasSemana();

    this.subscription = this.areasVisitadasSemana$.subscribe((data) => {
      console.log('Datos cargados:', data); // Depuración
      this.renderBubbleChart(data);
    });
  }

  renderBubbleChart(data: { area: string; countQR: number; countOtros: number }[]) {
    const canvas = document.getElementById('escaneosChart') as HTMLCanvasElement;

    // Preparar datos para el gráfico
    const chartData = data.map((item) => ({
      label: item.area,
      data: [
        { x: item.countQR, y: item.countOtros, r: Math.max(item.countQR, item.countOtros) + 5 } // Radio dinámico
      ],
      backgroundColor: this.getColorByArea(item.area),
    }));

    if (this.chart) {
      this.chart.destroy(); // Destruir el gráfico anterior
    }

    this.chart = new Chart(canvas, {
      type: 'bubble' as ChartType,
      data: {
        datasets: chartData
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const { x, y } = context.raw as any;
                return `${context.dataset.label}: QR: ${x}, Otros: ${y}`;
              }
            }
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 20
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Escaneos QR'
            },
            beginAtZero: true
          },
          y: {
            title: {
              display: true,
              text: 'Accesos Otros'
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  getColorByArea(area: string): string {
    // Asignar un color único a cada área
    const colorMap: { [key: string]: string } = {
      'Selva Tropical': 'rgba(75, 192, 192, 0.8)', // Verde
      'Sabana Africana': 'rgba(255, 159, 64, 0.8)', // Naranja
      'Acuario': 'rgba(54, 162, 235, 0.8)', // Azul
      'Montañas': 'rgba(255, 99, 132, 0.8)', // Rojo
    };
    return colorMap[area] || 'rgba(128, 128, 128, 0.8)'; // Gris por defecto
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }

}
