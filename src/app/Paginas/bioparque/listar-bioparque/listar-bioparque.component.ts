import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Bioparque, BioparqueService } from '../../../data-acces/bioparque.service';
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

  private bioparqueService = inject(BioparqueService);
  bioparques: Bioparque[] = [];
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


  loadInitialPage() {
    this.loading = true;
    this.bioparqueService.getBioparquePaginados(this.pageSize).then(data => {
      this.bioparques = data.bioparque;
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
      this.bioparqueService.getBioparquePaginados(this.pageSize, this.lastVisible).then(data => {
        this.bioparques = data.bioparque;
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
        this.bioparqueService.getBioparquePaginadosAnterior(this.pageSize, previousPage.firstVisible).then(data => {
          this.bioparques = data.bioparque;
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
      this.bioparqueService.buscarBioparque(searchTerm).then(bioparque => {
        this.bioparques = bioparque; // Mostrar resultados de búsqueda
        this.loading = false;
      });
    } else {
      this.loadInitialPage(); // Volver a la paginación cuando no haya búsqueda
    }
  }




}
