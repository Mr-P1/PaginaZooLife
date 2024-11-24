import { Component, OnDestroy, OnInit } from '@angular/core';
import { estadisticaService } from '../estadisitca.service';
import { AnimalesService, AnimalConValoraciones } from '../../../data-acces/animales.service';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-popularidad-animal',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './popularidad-animal.component.html',
  styleUrl: './popularidad-animal.component.scss'
})
export class PopularidadAnimalComponent implements OnInit, OnDestroy{
  searchText: string = '';
  isPreviousDisabled: boolean = true;
  isNextDisabled: boolean = false;

  private animalesSubscription!: Subscription;
  animales: AnimalConValoraciones[] = [];
  displayedAnimales: AnimalConValoraciones[] = []; // Los animales que se muestran en la página actual
  filteredAnimales: AnimalConValoraciones[] = []; // Resultado del filtro
  currentPage: number = 1;
  pageSize: number = 5;

  constructor(private estadisticaService: estadisticaService) {}

  ngOnInit(): void {
    this.animalesSubscription = this.estadisticaService.getAnimalesConValoraciones().subscribe({
      next: (animales) => {
        this.animales = animales;
        this.filteredAnimales = [...this.animales]; // Inicialmente, sin filtro
        this.applyPagination();
      },
      error: (error) => console.error('Error al obtener animales:', error),
    });
  }

  searchAnimals(): void {
    const search = this.searchText.trim().toLowerCase();
    if (search) {
      this.filteredAnimales = this.animales.filter((animal) =>
        animal.nombre_comun.toLowerCase().includes(search)
      );
    } else {
      this.filteredAnimales = [...this.animales]; // Restablece el filtro
    }
    this.currentPage = 1; // Reinicia a la primera página
    this.applyPagination();
  }

  applyPagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedAnimales = this.filteredAnimales.slice(start, end);

    // Actualiza el estado de los botones de paginación
    this.isPreviousDisabled = this.currentPage === 1;
    this.isNextDisabled = end >= this.filteredAnimales.length;
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
    if (this.animalesSubscription) {
      this.animalesSubscription.unsubscribe();
    }
  }
}
