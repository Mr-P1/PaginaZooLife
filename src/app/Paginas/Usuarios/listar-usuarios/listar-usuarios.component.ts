import { Component, OnInit } from '@angular/core';
import { UsuarioService, Usuario } from '../../../data-acces/usuarios.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionesService } from '../../../data-acces/notificaciones.service'
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-usuarios',
  templateUrl: './listar-usuarios.component.html',
  styleUrls: ['./listar-usuarios.component.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
})
export class ListarUsuariosComponent implements OnInit {
  usuarios: (Usuario & { boletasUsadas: number })[] = [];
  lastVisible: any = null;
  firstVisible: any = null;
  pageSize = 5;
  currentPage = 1;
  loading = false;
  searchTerm: string = ''; // Variable para almacenar el término de búsqueda

  // Almacena las referencias de las páginas anteriores
  pageStack: { firstVisible: any, lastVisible: any }[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private notificacionesService: NotificacionesService,
  ) { }

  ngOnInit() {
    this.loadInitialPage();
  }

  // Cargar la primera página de usuarios
  async loadInitialPage() {
    this.loading = true;
    this.pageStack = []; // Limpiar la pila al cargar la primera página
    try {
      const data = await this.usuarioService.getUsuariosPaginados(this.pageSize);
      const boletasPorUsuario = await this.usuarioService.getBoletasUsadasPorUsuario();

      // Unir la información de los usuarios con la cantidad de boletas usadas
      this.usuarios = data.usuarios.map(usuario => ({
        ...usuario,
        boletasUsadas: boletasPorUsuario[usuario.auth_id] || 0, // Añadir boletas usadas
      }));

      this.lastVisible = data.lastVisible;
      this.firstVisible = data.firstVisible;
    } catch (error) {
      console.error('Error al cargar los usuarios:', error);
    } finally {
      this.loading = false;
    }
  }

// Cargar la siguiente página de usuarios
async loadNextPage() {
  if (this.lastVisible) {
    this.loading = true;
    try {
      const data = await this.usuarioService.getUsuariosPaginados(this.pageSize, this.lastVisible);
      const boletasPorUsuario = await this.usuarioService.getBoletasUsadasPorUsuario();

      this.usuarios = data.usuarios.map(usuario => ({
        ...usuario,
        boletasUsadas: boletasPorUsuario[usuario.auth_id] || 0
      }));

      // Guarda las referencias de la página actual en la pila
      this.pageStack.push({ firstVisible: this.firstVisible, lastVisible: this.lastVisible });

      this.firstVisible = data.firstVisible;
      this.lastVisible = data.lastVisible;
      this.currentPage++;
    } catch (error) {
      console.error('Error al cargar la siguiente página:', error);
    } finally {
      this.loading = false;
    }
  }
}

// Cargar la página anterior de usuarios
async loadPreviousPage() {
  if (this.pageStack.length > 0) {
    this.loading = true;
    const previousPage = this.pageStack.pop();
    if (previousPage) {
      try {
        const data = await this.usuarioService.getUsuariosPaginadosAnterior(this.pageSize, previousPage.firstVisible);
        const boletasPorUsuario = await this.usuarioService.getBoletasUsadasPorUsuario();

        this.usuarios = data.usuarios.map(usuario => ({
          ...usuario,
          boletasUsadas: boletasPorUsuario[usuario.auth_id] || 0
        }));

        // Actualiza las referencias de la página
        this.firstVisible = previousPage.firstVisible;
        this.lastVisible = previousPage.lastVisible;
        this.currentPage--;
      } catch (error) {
        console.error('Error al cargar la página anterior:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}

  // Manejar cambios en el campo de búsqueda
  onSearchChange(event: any) {
    const searchTerm = event.target.value.trim();

    if (searchTerm) {
      this.loading = true;
      this.usuarioService.buscarUsuarios(searchTerm).then(async usuarios => {
        const boletasPorUsuario = await this.usuarioService.getBoletasUsadasPorUsuario();

        // Combina usuarios con la cantidad de boletas usadas
        this.usuarios = usuarios.map(usuario => ({
          ...usuario,
          boletasUsadas: boletasPorUsuario[usuario.auth_id] || 0
        }));

        this.loading = false;
      });
    } else {
      this.loadInitialPage(); // Volver a la paginación cuando no haya búsqueda
    }
  }





  mostrarFormulario(token: string | null) {
    Swal.fire({
      icon: "question",
      title: 'Enviar notificación',
      html: `
        <input type="text" id="titulo" class="swal2-input" placeholder="Título">
        <textarea id="contenido" class="swal2-textarea" placeholder="Contenido" style="width: 90%;  resize: none;"></textarea>
      `,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        // Obtener los valores ingresados por el usuario
        const titulo = (document.getElementById('titulo') as HTMLInputElement).value;
        const contenido = (document.getElementById('contenido') as HTMLTextAreaElement).value;
        //const imagenUrl = (document.getElementById('imagenUrl') as HTMLInputElement).value || null;

        if (!titulo || !contenido) {
          Swal.showValidationMessage('Por favor, ingresa un título y contenido');
          return false;
        }


        // Si no hay imagen, devuelve solo título y contenido
        return { titulo, contenido, imagenUrl: null };


      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { titulo, contenido, imagenUrl } = result.value!;
        // Llama a enviarNotificacion2 pasando el token como un array y los datos de la notificación
        this.enviarNotificacion(token ? [token] : [], titulo, contenido, imagenUrl)



      }
    });
  }



  mostrarFormularioTodos() {
    Swal.fire({
      icon: "question",
      title: 'Enviar notificación',
      html: `
        <input type="text" id="titulo" class="swal2-input" placeholder="Título">
        <textarea id="contenido" class="swal2-textarea" placeholder="Contenido" style="width: 90%;  resize: none;"></textarea>
      `,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const titulo = (document.getElementById('titulo') as HTMLInputElement).value;
        const contenido = (document.getElementById('contenido') as HTMLTextAreaElement).value;

        if (!titulo || !contenido) {
          Swal.showValidationMessage('Por favor, ingresa un título y contenido');
          return false;
        }

        return { titulo, contenido };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { titulo, contenido } = result.value!;
        // Llama a obtenerTokensDeUsuarios para obtener los tokens y luego envía la notificación
        this.usuarioService.obtenerTokensDeUsuarios().subscribe((tokens) => {
          this.enviarNotificacion(tokens, titulo, contenido, null);
        });
      }
    });
  }


  enviarNotificacion(tokens: string[], title: string, bodyContent: string, imageUrl: string | null = null) {
    const data = {};

    this.notificacionesService.sendPushNotification3(tokens, title, bodyContent, imageUrl, data).subscribe(
      (response) => {
        console.log('Notificación enviada con éxito:', response);
        Swal.fire({
          icon: 'success',
          title: '¡Notificación Enviada!',
          text: 'La notificación se ha enviado correctamente.',
          confirmButtonText: 'Aceptar',
          backdrop: 'rgba(0, 0, 0, 0.8)'
        });
      },
      (error) => {
        console.error('Error al enviar la notificación:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al Enviar',
          text: 'No se pudo enviar la notificación. Por favor, intenta nuevamente.',
          confirmButtonText: 'Aceptar',
          backdrop: 'rgba(0, 0, 0, 0.8)'
        });
      }
    );
  }





}
