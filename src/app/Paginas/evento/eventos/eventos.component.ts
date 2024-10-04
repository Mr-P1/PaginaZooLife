import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AnimalesService, evento } from '../../../data-acces/animales.service'; // Asegúrate de que el servicio maneje eventos
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importa FormsModule

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss']
})
export class ListarEventosComponent implements OnInit {
  private animalesService = inject(AnimalesService);
  eventos: evento[] = [];   // Variable para almacenar los eventos
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

  // Cargar la primera página de eventos
  loadInitialPage() {
    this.loading = true;
    this.animalesService.getEventosPaginados(this.pageSize).then(data => {
      this.eventos = data.eventos;
      this.lastVisible = data.lastVisible;
      this.firstVisible = data.firstVisible;
      this.pageStack.push({ firstVisible: this.firstVisible, lastVisible: this.lastVisible });
      this.loading = false;
    });
  }

  // Cargar la siguiente página de eventos
  loadNextPage() {
    if (this.lastVisible) {
      this.loading = true;
      this.animalesService.getEventosPaginados(this.pageSize, this.lastVisible).then(data => {
        this.eventos = data.eventos;
        this.lastVisible = data.lastVisible;
        this.firstVisible = data.firstVisible;
        this.pageStack.push({ firstVisible: this.firstVisible, lastVisible: this.lastVisible });
        this.currentPage += 1;
        this.loading = false;
      });
    }
  }

  // Cargar la página anterior de eventos
  loadPreviousPage() {
    if (this.currentPage > 1) {
      this.pageStack.pop();
      const previousPage = this.pageStack[this.pageStack.length - 1];

      if (previousPage) {
        this.loading = true;
        this.animalesService.getEventosPaginadosAnterior(this.pageSize, previousPage.firstVisible).then(data => {
          this.eventos = data.eventos;
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
      this.animalesService.buscarEventos(searchTerm).then(evento => {
        this.eventos = evento; // Mostrar resultados de búsqueda
        this.loading = false;
      });
    } else {
      this.loadInitialPage(); // Volver a la paginación cuando no haya búsqueda
    }
  }
}
