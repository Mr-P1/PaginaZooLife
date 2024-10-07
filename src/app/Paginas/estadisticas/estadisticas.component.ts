import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnimalesService, AnimalConValoraciones } from '../../data-acces/animales.service';
import { CommonModule } from '@angular/common';
import { format } from 'date-fns';
import { Subscription } from 'rxjs';
import { es } from 'date-fns/locale'; // Configuración regional en español
import { RespuestasService } from '../../data-acces/respuestas.service';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss']
})
export class EstadisticasComponent implements OnInit, OnDestroy {

  animales: AnimalConValoraciones[] = [];
  visitantesHoy: number = 0; // Inicializa en 0
  today!: string; // Variable para almacenar la fecha de hoy
  private visitantesSubscription!: Subscription;

  respuestasTotales: number = 0;
  respuestasCorrectas: number = 0;
  respuestasIncorrectas: number = 0;
  promedioCorrectas: number = 0;

  private respuestasSubscription!: Subscription;

  constructor(
    private _animalesService: AnimalesService,
    private respuestasService: RespuestasService
  ) {
    // Formato de la fecha cambiado a 'dd/MM/yyyy'
    this.today = format(new Date(), 'dd/MM/yyyy', { locale: es });
  }

  ngOnInit(): void {

    this.cargarAnimalesConValoraciones();

    // Suscribirse a los cambios en tiempo real de los visitantes
    this.visitantesSubscription = this._animalesService.obtenerVisitantesHoy().subscribe({
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
      }}
    )

  }

  ngOnDestroy(): void {
    // Asegúrate de desuscribirte cuando el componente se destruya
    if (this.visitantesSubscription) {
      this.visitantesSubscription.unsubscribe();
    }
  }

  async cargarAnimalesConValoraciones() {
    this.animales = await this._animalesService.getAnimalesConValoraciones();
  }
}
