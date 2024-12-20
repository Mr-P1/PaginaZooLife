import { Component, OnInit } from '@angular/core';
import { UsuarioService, Usuario, PremioUsuario } from '../../../data-acces/usuarios.service';
import { PremioTrivia, PremiosService } from '../../../data-acces/premios.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { BoletasService } from '../../../data-acces/boletas.service';
import Swal from 'sweetalert2'; // Importar SweetAlert

@Component({
  selector: 'app-ver-mas',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './ver-mas.component.html',
  styleUrl: './ver-mas.component.scss'
})
export class VerMasComponent implements OnInit {
  usuario!: Usuario;
  premiosDetallados: { premioUsuario: PremioUsuario; premioTrivia: PremioTrivia | null }[] = [];
  respuestasCorrectas: number = 0;
  respuestasIncorrectas: number = 0;
  respuestasTotales:number = 0;
  promedioCorrectas: number = 0;
  idActiva = "";
  usuariosConBoletas: any[] = [];

  ultimaVisita = "";
  boletasUsadas = 0;

  constructor(
    private usuarioService: UsuarioService,
    private _rutaActiva: ActivatedRoute,
    private boletasService: BoletasService,
    private premiosService:PremiosService
  ) { }

  ngOnInit() {
    this._rutaActiva.paramMap.subscribe(data => {
      this.idActiva = data.get("IdUsuario")!;

      this.cargarUsuariosConBoletas(this.idActiva);

      // Obtener la información del usuario
      this.usuarioService.getUsuario2(this.idActiva).subscribe(user => {
        if (user) {
          this.usuario = user;

          // Obtener las respuestas correctas e incorrectas del usuario
          this.usuarioService.getRespuestasPorUsuario(user.auth_id).subscribe(({ correctas, incorrectas,total }) => {
            this.respuestasCorrectas = correctas;
            this.respuestasIncorrectas = incorrectas;
            this.respuestasTotales = total;

            if (this.respuestasTotales > 0) {
              this.promedioCorrectas = (this.respuestasCorrectas / this.respuestasTotales) * 100;
            } else {
              this.promedioCorrectas = 0;  // Evitar dividir por 0 si no hay respuestas
            }
          });
        }
      });

      // Obtener los premios del usuario y sus detalles
      this.usuarioService.getPremiosPorUsuario(this.idActiva).pipe(
        switchMap((premiosUsuarios: PremioUsuario[]) => {
          const premiosObservables: Observable<{ premioUsuario: PremioUsuario, premioTrivia: PremioTrivia | null }>[] = premiosUsuarios.map((premioUsuario) => {
            return this.usuarioService.getPremioTriviaById(premioUsuario.premioId).pipe(
              map(premioTrivia => ({
                premioUsuario,
                premioTrivia
              }))
            );
          });
          return forkJoin(premiosObservables);
        })
      ).subscribe((premiosDetallados) => {
        this.premiosDetallados = premiosDetallados;
      });
    });
  }



  cargarUsuariosConBoletas(id:String) {
    this.boletasService.obtenerBoletasPorUsuario(String(id)).subscribe(usuarios => {
      this.boletasUsadas = usuarios.boletasUsadas
      this.ultimaVisita = usuarios.ultimaVisita
    });
  }

  canjearPremioUsuario(premioUsuarioId: string) {
    // Mostrar la alerta de confirmación
    Swal.fire({
      title: '¿Estás seguro de canjearlo?',
      text: 'Esta acción no puede deshacerse.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, canjear',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, realizar el canje
        this.premiosService.canjearPremioUsuario(premioUsuarioId).then(() => {
          console.log(`Premio con ID ${premioUsuarioId} canjeado exitosamente.`);

          // Actualizar el estado en la vista
          const premio = this.premiosDetallados.find(detalle => detalle.premioUsuario.id === premioUsuarioId);
          if (premio) {
            premio.premioUsuario.estado = false; // Cambiar a booleano
          }

          // Mostrar mensaje de éxito con SweetAlert
          Swal.fire({
            icon: 'success',
            title: '¡Premio canjeado correctamente!',
            showConfirmButton: false,
            timer: 1500
          });
        }).catch(error => {
          console.error('Error al canjear el premio:', error);

          // Mostrar mensaje de error si ocurre algún problema
          Swal.fire({
            icon: 'error',
            title: 'Error al canjear el premio',
            text: 'Ocurrió un problema, por favor intenta nuevamente.',
          });
        });
      } else if (result.isDismissed) {
        console.log('El canje fue cancelado');
      }
    });
  }



}
