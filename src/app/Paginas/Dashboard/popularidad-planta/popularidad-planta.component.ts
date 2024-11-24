
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
export class PopularidadPlantaComponent implements OnInit, OnDestroy{
  plantas: PlantaConValoraciones[] = [];
  displayedPlantas: PlantaConValoraciones[] = []; // Plantas que se muestran en la página actual
  filteredPlantas: PlantaConValoraciones[] = []; // Resultado del filtro
  searchText: string = '';
  currentPage: number = 1;
  pageSize: number = 5;
  isPreviousDisabled: boolean = true;
  isNextDisabled: boolean = false;

  private plantasSubscription!: Subscription;

  constructor(private plantaService: PlantaService) {}

  ngOnInit(): void {
    this.plantasSubscription = this.plantaService.getPlantasConValoraciones().subscribe({
      next: (plantas) => {
        this.plantas = plantas;
        this.filteredPlantas = [...this.plantas]; // Inicialmente, todas las plantas
        this.applyPagination();
      },
      error: (error) => console.error('Error al obtener plantas:', error),
    });
  }

  searchPlantas(): void {
    const search = this.searchText.trim().toLowerCase();
    if (search) {
      this.filteredPlantas = this.plantas.filter((planta) =>
        planta.nombre_comun.toLowerCase().includes(search)
      );
    } else {
      this.filteredPlantas = [...this.plantas]; // Restablece el filtro
    }
    this.currentPage = 1; // Reinicia la paginación al buscar
    this.applyPagination();
  }

  applyPagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedPlantas = this.filteredPlantas.slice(start, end);

    // Actualiza el estado de los botones de paginación
    this.isPreviousDisabled = this.currentPage === 1;
    this.isNextDisabled = end >= this.filteredPlantas.length;
  }

  nextPage(): void {
    if (!this.isNextDisabled) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  previousPage(): void {
    if (!this.isPreviousDisabled) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  ngOnDestroy(): void {
    if (this.plantasSubscription) {
      this.plantasSubscription.unsubscribe();
    }
  }

}
