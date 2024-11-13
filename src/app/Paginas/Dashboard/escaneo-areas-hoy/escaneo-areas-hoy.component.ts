import { Component, OnInit } from '@angular/core';
import { estadisticaService } from '../estadisitca.service';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AnimalesService } from '../../../data-acces/animales.service';

@Component({
  selector: 'app-escaneo-areas-hoy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './escaneo-areas-hoy.component.html',
  styleUrl: './escaneo-areas-hoy.component.scss'
})
export class EscaneoAreasHoyComponent implements OnInit{
  areasVisitadasHoy$!: Observable<{ area: string; countQR: number; countOtros: number }[]>;

  areasMasVisitadas: { area: string, count: number }[] = [];
  private areasSubscription!: Subscription; // Nueva suscripción para las áreas

  constructor(private estadisticaService: estadisticaService,
    private _animalesService: AnimalesService,
  ) {}

  ngOnInit(): void {
    // this.areasVisitadasHoy$ = this.estadisticaService.getAreasMasVisitadas();


    this.cargarAreasMasVisitadasEnTiempoReal()

  }

  cargarAreasMasVisitadasEnTiempoReal(): void {
    this.areasSubscription = this.estadisticaService.getAreasMasVisitadasRealtime().subscribe({
      next: (areas) => {
        this.areasMasVisitadas = areas;
      },
      error: (error) => console.error('Error al cargar las áreas más visitadas en tiempo real:', error)
    });
  }

}
