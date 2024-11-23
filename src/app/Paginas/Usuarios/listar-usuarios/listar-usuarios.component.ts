import { Component, OnInit } from '@angular/core';
import { UsuarioService, Usuario } from '../../../data-acces/usuarios.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OirsService } from '../../../data-acces/oirs.service'
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

  // Pila para almacenar las referencias a los documentos de las páginas anteriores
  pageStack: { firstVisible: any, lastVisible: any }[] = [];


  // Contadores para los tipos de OIRS
  cantidadConsulta: number = 0;
  cantidadFelicitacion: number = 0;
  cantidadReclamo: number = 0;
  cantidadSugerencia: number = 0;

  constructor(
    private usuarioService: UsuarioService,
    private oirsService: OirsService,
    private notificacionesService: NotificacionesService,
  ) { }

  ngOnInit() {
    this.loadInitialPage();
    this.loadOirsCounts();
  }

  // Método para cargar la cantidad de OIRS por tipo
  loadOirsCounts() {
    this.oirsService.getOirsConsulta().subscribe((oirs) => {
      this.cantidadConsulta = oirs.length;
    });

    this.oirsService.getOirsFelicitacion().subscribe((oirs) => {
      this.cantidadFelicitacion = oirs.length;
    });

    this.oirsService.getOirsReclamo().subscribe((oirs) => {
      this.cantidadReclamo = oirs.length;
    });

    this.oirsService.getOirsSugerencia().subscribe((oirs) => {
      this.cantidadSugerencia = oirs.length;
    });
  }

  // Cargar la primera página de usuarios
  async loadInitialPage() {
    this.loading = true;
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
  // Cargar la siguiente página de usuarios
  loadNextPage() {
    if (this.lastVisible) {
      this.loading = true;
      this.usuarioService.getUsuariosPaginados(this.pageSize, this.lastVisible).then(async data => {
        const boletasPorUsuario = await this.usuarioService.getBoletasUsadasPorUsuario();

        // Combina usuarios con la cantidad de boletas usadas
        this.usuarios = data.usuarios.map(usuario => ({
          ...usuario,
          boletasUsadas: boletasPorUsuario[usuario.auth_id] || 0
        }));

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
        this.usuarioService.getUsuariosPaginadosAnterior(this.pageSize, previousPage.firstVisible).then(async data => {
          const boletasPorUsuario = await this.usuarioService.getBoletasUsadasPorUsuario();

          // Combina usuarios con la cantidad de boletas usadas
          this.usuarios = data.usuarios.map(usuario => ({
            ...usuario,
            boletasUsadas: boletasPorUsuario[usuario.auth_id] || 0
          }));

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




  convertirImagenABase64(file: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
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
