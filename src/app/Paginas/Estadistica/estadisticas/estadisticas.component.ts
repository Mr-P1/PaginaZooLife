import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnimalesService, AnimalConValoraciones } from '../../../data-acces/animales.service';
import { CommonModule } from '@angular/common';
import { format } from 'date-fns';
import { Subscription } from 'rxjs';
import { es } from 'date-fns/locale'; // Configuración regional en español
import { RespuestasService } from '../../../data-acces/respuestas.service';
import { BoletasService } from '../../../data-acces/boletas.service';
import {BioparqueService, PlantaConValoraciones} from '../../../data-acces/bioparque.service'
import { RouterModule } from '@angular/router';
import { Chart,ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss']
})

export class EstadisticasComponent implements OnInit, OnDestroy {

  animales: AnimalConValoraciones[] = [];
  plantas:PlantaConValoraciones[] = [];
  visitantesHoy: number = 0; // Inicializa en 0
  today!: string; // Variable para almacenar la fecha de hoy
  private visitantesSubscription!: Subscription;

  respuestasTotales: number = 0;
  respuestasCorrectas: number = 0;
  respuestasIncorrectas: number = 0;
  promedioCorrectas: number = 0;
  pieChart!: Chart; // Variable para el gráfico de torta (pie chart)

  private respuestasSubscription!: Subscription;
  private animalesSubscription!: Subscription;
  private plantasSubscription!: Subscription;

  constructor(
    private _animalesService: AnimalesService,
    private _plantaService:BioparqueService,
    private _boletasService: BoletasService,
    private respuestasService: RespuestasService
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


    this.visitantesSubscription = this._boletasService.obtenerVisitantesHoy().subscribe({
      next: (visitantes: number) => {
        this.visitantesHoy = visitantes;
      },
      error: (error) => {
        console.error('Error al obtener visitantes hoy:', error);
      }
    });

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



  ngOnDestroy(): void {
    // Asegúrate de desuscribirte cuando el componente se destruya
    if (this.visitantesSubscription) {
      this.visitantesSubscription.unsubscribe();
    }

    if (this.animalesSubscription) this.animalesSubscription.unsubscribe();
    if (this.plantasSubscription) this.plantasSubscription.unsubscribe();


    if (this.respuestasSubscription) {
      this.respuestasSubscription.unsubscribe();
    }
    if (this.pieChart) {
      this.pieChart.destroy();
    }


  }




}

