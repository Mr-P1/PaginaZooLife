import { Component, OnInit } from '@angular/core';
import { UsuarioService, Usuario } from '../../../data-acces/usuarios.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OirsService } from '../../../data-acces/oirs.service'
import { NotificacionesService } from '../../../data-acces/notificaciones.service'

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




  //  // Método para enviar una notificación de prueba
  //  enviarNotificacion() {
  //   const tokens = [this.token]; // Arreglo con el token que quieres usar
  //   const data = {}; // Puedes agregar datos adicionales si deseas

  //   this.notificacionesService.sendPushNotification(tokens, data).subscribe(
  //     (response) => {
  //       console.log('Notificación enviada con éxito:', response);
  //     },
  //     (error) => {
  //       console.error('Error al enviar la notificación:', error);
  //     }
  //   );
  // }


  private token2="eX6eSeIzQ0a-x4SmkcN_6l:APA91bGGp-VqCthb-UDisSzODv2Ekn85gTOitg1K28FhzNkxHis0sbK9R8nDRWejleSvHPAzTOp_T9Rd5BGaWUEZjo56npvnQ9er9IhA6HqyhVgdm8Lne-wqRvodQ6anDTDDzDMv36y-"


  private token ="eyKAniVvQHiP_xs_7Cxkg8:APA91bEghwmEMzjudZdFzXdKy6CyUUJ4akGmXarTiiWPLyKwOVsK3heaOaQWKHK-b-OAxwf8ME59rpdwsdNFxF8rPvWGwMS6ukZzUIerZa1qrm0LnKq2lQQ"
  // Método para enviar una notificación de prueba
  enviarNotificacion2() {
    const tokens = [this.token2,this.token]; // Arreglo con el token que quieres usar
    const data = {}; // Puedes agregar datos adicionales si deseas

    this.notificacionesService.sendPushNotification2(tokens, data).subscribe(
      (response) => {
        console.log('Notificación enviada con éxito:', response);
      },
      (error) => {
        console.error('Error al enviar la notificación:', error);
      }
    );
  }


}
