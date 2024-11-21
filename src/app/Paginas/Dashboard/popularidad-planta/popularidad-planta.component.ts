
import { PlantaService, PlantaConValoraciones } from '../../../data-acces/bioparque.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {estadisticaService} from '../estadisitca.service'
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-popularidad-planta',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './popularidad-planta.component.html',
  styleUrl: './popularidad-planta.component.scss'
})
export class PopularidadPlantaComponent {
  plantas: PlantaConValoraciones[] = [];
  private plantasSubscription!: Subscription;
  searchText: string = '';
  isPreviousDisabled: boolean = true;
  isNextDisabled: boolean = false;

  constructor( private estadisticaService: PlantaService){}


  ngOnInit(): void {
    this.plantasSubscription = this.estadisticaService.getPlantasConValoraciones().subscribe({
      next: (plantas) => {
        this.plantas = plantas;
      },
      error: (error) => console.error('Error al obtener plantas:', error)
    });

  }

  searchPlantas() {

  }

  nextPage() {

  }

  previousPage() {
  }

}
