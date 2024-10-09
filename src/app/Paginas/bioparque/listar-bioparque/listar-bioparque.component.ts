import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Planta, PlantaService } from '../../../data-acces/bioparque.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-bioparque',
  standalone: true,
  imports:[RouterModule, CommonModule, FormsModule],
  templateUrl: './listar-bioparque.component.html',
  styleUrl: './listar-bioparque.component.scss'
})
export class ListarBioparqueComponent  implements OnInit {

  private plantaService = inject(PlantaService);
  plantas: Planta[] = [];
  lastVisible: any = null;
  firstVisible: any = null;
  pageSize = 5;
  currentPage = 1;
  loading = false;
  searchTerm: string = '';  // Variable para almacenar el término de búsqueda

  // Pila para almacenar las referencias a los documentos de las páginas anteriores
  pageStack: { firstVisible: any, lastVisible: any }[] = [];

  ngOnInit() {
    this.loadInitialPage();
  }

  // Cargar la página inicial
  loadInitialPage() {
    this.loading = true;
    this.plantaService.getPlantasPaginadas(this.pageSize).then(data => {
      this.plantas = data.plantas;  // Cambié `bioparque` a `plantas`
      this.lastVisible = data.lastVisible;
      this.firstVisible = data.firstVisible;
      this.pageStack.push({ firstVisible: this.firstVisible, lastVisible: this.lastVisible });
      this.loading = false;
    });
  }

  // Cargar la siguiente página
  loadNextPage() {
    if (this.lastVisible) {
      this.loading = true;
      this.plantaService.getPlantasPaginadas(this.pageSize, this.lastVisible).then(data => {
        this.plantas = data.plantas; // Cambié `bioparque` a `plantas`
        this.lastVisible = data.lastVisible;
        this.firstVisible = data.firstVisible;
        this.pageStack.push({ firstVisible: this.firstVisible, lastVisible: this.lastVisible });
        this.currentPage += 1;
        this.loading = false;
      });
    }
  }

  // Cargar la página anterior
  loadPreviousPage() {
    if (this.currentPage > 1) {
      this.pageStack.pop();
      const previousPage = this.pageStack[this.pageStack.length - 1];

      if (previousPage) {
        this.loading = true;
        this.plantaService.getPlantasPaginadasAnterior(this.pageSize, previousPage.firstVisible).then(data => {
          this.plantas = data.plantas; // Cambié `bioparque` a `plantas`
          this.lastVisible = data.lastVisible;
          this.firstVisible = previousPage.firstVisible;
          this.currentPage -= 1;
          this.loading = false;
        });
      }
    }
  }

  // Manejar cambios en el campo de búsqueda
  onSearchChange(event: any) {
    const searchTerm = event.target.value.trim();

    if (searchTerm) {
      this.loading = true;
      this.plantaService.buscarPlantas(searchTerm).then(plantas => {
        this.plantas = plantas; // Mostrar resultados de búsqueda
        this.loading = false;
      });
    } else {
      this.loadInitialPage(); // Volver a la paginación cuando no haya búsqueda
    }
  }



}

