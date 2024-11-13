import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnimalesService, AnimalConValoraciones } from '../../../data-acces/animales.service';
import { CommonModule } from '@angular/common';
import { format } from 'date-fns';
import { Subscription } from 'rxjs';
import { es } from 'date-fns/locale'; // Configuración regional en español
import { RespuestasService } from '../../../data-acces/respuestas.service';
import { BoletasService } from '../../../data-acces/boletas.service';
import { PlantaService, PlantaConValoraciones } from '../../../data-acces/bioparque.service';
import { RouterModule } from '@angular/router';
import { Chart, ChartType } from 'chart.js/auto';
import { OirsService } from '../../../data-acces/oirs.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy{

  animales: AnimalConValoraciones[] = [];
  plantas: PlantaConValoraciones[] = [];
  visitantesHoy: number = 0; // Inicializa en 0
  today!: string; // Variable para almacenar la fecha de hoy
  private visitantesSubscription!: Subscription;

  respuestasTotales: number = 0;
  respuestasCorrectas: number = 0;
  respuestasIncorrectas: number = 0;

  respuestasdividido:number = 0;
  promedioCorrectas: number = 0;
  promedioIncorrectas: number = 0;

  private respuestasSubscription!: Subscription;
  private animalesSubscription!: Subscription;
  private plantasSubscription!: Subscription;
  private areasSubscription!: Subscription; // Nueva suscripción para las áreas

  areasMasVisitadas: { area: string, count: number }[] = [];

  constructor(
    private _animalesService: AnimalesService,
    private _plantaService: PlantaService,
    private _boletasService: BoletasService,
    private respuestasService: RespuestasService,
    private oirsService: OirsService
  ) {
    // Formato de la fecha cambiado a 'dd/MM/yyyy'
    this.today = format(new Date(), 'dd/MM/yyyy', { locale: es });
  }

  ngOnInit(): void {




    this.animalesSubscription = this._animalesService.getAnimalesConValoraciones().subscribe({
      next: (animales) => {
        this.animales = animales;
      },
      error: (error) => console.error('Error al obtener animales:', error)
    });

    this.plantasSubscription = this._plantaService.getPlantasConValoraciones().subscribe({
      next: (plantas) => {
        this.plantas = plantas;
      },
      error: (error) => console.error('Error al obtener plantas:', error)
    });


    this.respuestasSubscription = this.respuestasService.getRespuestasTrivia().subscribe({
      next: (respuestas) => {
        this.respuestasTotales = respuestas.total;
        this.respuestasCorrectas = respuestas.correctas;
        this.respuestasIncorrectas = respuestas.incorrectas;

        if (this.respuestasTotales > 0) {
          this.promedioCorrectas = (this.respuestasCorrectas / this.respuestasTotales) * 100;
          this.promedioIncorrectas = (this.respuestasIncorrectas / this.respuestasTotales) * 100;
          this.respuestasdividido= (this.respuestasTotales / 10)
        } else {
          this.promedioCorrectas = 0;  // Evitar dividir por 0 si no hay respuestas
        }


      }
    });

    this.cargarAreasMasVisitadasEnTiempoReal();
  }




  // crearGraficoOirs(labels: string[], data: number[]): void {
  //   const ctx = document.getElementById('oirsChart') as HTMLCanvasElement;
  //   if (this.oirsChart) {
  //     this.oirsChart.destroy(); // Destruye el gráfico anterior si existe para evitar duplicados
  //   }

  //   this.oirsChart = new Chart(ctx, {
  //     type: 'bar',
  //     data: {
  //       labels: labels,
  //       datasets: [
  //         {
  //           label: 'Consulta',
  //           data: [data[0]], // Datos para 'Consulta'
  //           backgroundColor: '#FF6384',
  //           borderColor: '#FF6384',
  //           borderWidth: 1,
  //         },
  //         {
  //           label: 'Felicitación',
  //           data: [data[1]], // Datos para 'Felicitación'
  //           backgroundColor: '#36A2EB',
  //           borderColor: '#36A2EB',
  //           borderWidth: 1,
  //         },
  //         {
  //           label: 'Reclamo',
  //           data: [data[2]], // Datos para 'Reclamo'
  //           backgroundColor: '#FFCE56',
  //           borderColor: '#FFCE56',
  //           borderWidth: 1,
  //         },
  //         {
  //           label: 'Sugerencia',
  //           data: [data[3]], // Datos para 'Sugerencia'
  //           backgroundColor: '#4BC0C0',
  //           borderColor: '#4BC0C0',
  //           borderWidth: 1,
  //         },
  //       ],
  //     },
  //     options: {
  //       responsive: true,
  //       scales: {
  //         y: {
  //           beginAtZero: true,
  //         },
  //       },
  //     },
  //   });
  // }



  ngOnDestroy(): void {
    // Asegúrate de desuscribirte cuando el componente se destruya
    if (this.visitantesSubscription) {
      this.visitantesSubscription.unsubscribe();
    }

    if (this.animalesSubscription) this.animalesSubscription.unsubscribe();
    if (this.plantasSubscription) this.plantasSubscription.unsubscribe();
    if (this.respuestasSubscription) this.respuestasSubscription.unsubscribe();
    if (this.areasSubscription) this.areasSubscription.unsubscribe();




  }

  cargarAreasMasVisitadasEnTiempoReal(): void {
    this.areasSubscription = this._animalesService.getAreasMasVisitadasRealtime().subscribe({
      next: (areas) => {
        this.areasMasVisitadas = areas;
      },
      error: (error) => console.error('Error al cargar las áreas más visitadas en tiempo real:', error)
    });
  }

}
