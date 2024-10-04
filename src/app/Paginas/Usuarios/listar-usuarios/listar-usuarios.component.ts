import { Component, OnInit } from '@angular/core';
import { UsuarioService, Usuario } from '../../../data-acces/usuarios.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-usuarios',
  templateUrl: './listar-usuarios.component.html',
  styleUrls: ['./listar-usuarios.component.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
})
export class ListarUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  lastVisible: any = null;
  firstVisible: any = null;
  pageSize = 5;
  currentPage = 1;
  loading = false;
  searchTerm: string = ''; // Variable para almacenar el término de búsqueda

  // Pila para almacenar las referencias a los documentos de las páginas anteriores
  pageStack: { firstVisible: any, lastVisible: any }[] = [];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.loadInitialPage();
  }

  // Cargar la primera página de usuarios
  loadInitialPage() {
    this.loading = true;
    this.usuarioService.getUsuariosPaginados(this.pageSize).then(data => {
      this.usuarios = data.usuarios;
      this.lastVisible = data.lastVisible;
      this.firstVisible = data.firstVisible;
      this.pageStack.push({ firstVisible: this.firstVisible, lastVisible: this.lastVisible });
      this.loading = false;
    });
  }

  // Cargar la siguiente página de usuarios
  loadNextPage() {
    if (this.lastVisible) {
      this.loading = true;
      this.usuarioService.getUsuariosPaginados(this.pageSize, this.lastVisible).then(data => {
        this.usuarios = data.usuarios;
        this.lastVisible = data.lastVisible;
        this.firstVisible = data.firstVisible;
        this.pageStack.push({ firstVisible: this.firstVisible, lastVisible: this.lastVisible });
        this.currentPage += 1;
        this.loading = false;
      });
    }
  }

  // Cargar la página anterior de usuarios
  loadPreviousPage() {
    if (this.currentPage > 1) {
      this.pageStack.pop();
      const previousPage = this.pageStack[this.pageStack.length - 1];

      if (previousPage) {
        this.loading = true;
        this.usuarioService.getUsuariosPaginadosAnterior(this.pageSize, previousPage.firstVisible).then(data => {
          this.usuarios = data.usuarios;
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
      this.usuarioService.buscarUsuarios(searchTerm).then(usuarios => {
        this.usuarios = usuarios; // Mostrar resultados de búsqueda
        this.loading = false;
      });
    } else {
      this.loadInitialPage(); // Volver a la paginación cuando no haya búsqueda
    }
  }
}
