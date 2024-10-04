import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Noticia, Noticiaservice } from '../../../data-acces/noticias.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-noticia',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './listar-noticia.component.html',
  styleUrl: './listar-noticia.component.scss'
})
export class ListarNoticiaComponent implements OnInit {

  private noticiaService = inject(Noticiaservice);
  noticias: Noticia[] = [];
  lastVisible: any = null;
  firstVisible: any = null;
  pageSize = 5;
  currentPage = 1;
  loading = false;
  searchTerm: string = ''; // Variable para almacenar el término de búsqueda

  // Pila para almacenar las referencias a los documentos de las páginas anteriores
  pageStack: { firstVisible: any, lastVisible: any }[] = [];

  ngOnInit() {
    this.loadInitialPage();
  }

  // Cargar la primera página de noticias
  loadInitialPage() {
    this.loading = true;
    this.noticiaService.getNoticiasPaginadas(this.pageSize).then(data => {
      this.noticias = data.noticias;
      this.lastVisible = data.lastVisible;
      this.firstVisible = data.firstVisible;
      this.pageStack.push({ firstVisible: this.firstVisible, lastVisible: this.lastVisible });
      this.loading = false;
    });
  }

  // Cargar la siguiente página de noticias
  loadNextPage() {
    if (this.lastVisible) {
      this.loading = true;
      this.noticiaService.getNoticiasPaginadas(this.pageSize, this.lastVisible).then(data => {
        this.noticias = data.noticias;
        this.lastVisible = data.lastVisible;
        this.firstVisible = data.firstVisible;
        this.pageStack.push({ firstVisible: this.firstVisible, lastVisible: this.lastVisible });
        this.currentPage += 1;
        this.loading = false;
      });
    }
  }

  // Cargar la página anterior de noticias
  loadPreviousPage() {
    if (this.currentPage > 1) {
      this.pageStack.pop();
      const previousPage = this.pageStack[this.pageStack.length - 1];

      if (previousPage) {
        this.loading = true;
        this.noticiaService.getNoticiasPaginadasAnterior(this.pageSize, previousPage.firstVisible).then(data => {
          this.noticias = data.noticias;
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
      this.noticiaService.buscarNoticias(searchTerm).then(noticias => {
        this.noticias = noticias; // Mostrar resultados de búsqueda
        this.loading = false;
      });
    } else {
      this.loadInitialPage(); // Volver a la paginación cuando no haya búsqueda
    }
  }
}
