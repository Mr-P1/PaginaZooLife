import { Component, OnInit } from '@angular/core';
import { UsuarioService, Usuario, PremioUsuario } from '../../../data-acces/usuarios.service';
import { PremioTrivia } from '../../../data-acces/premios.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

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

  constructor(
    private usuarioService: UsuarioService,
    private _rutaActiva: ActivatedRoute,
  ) { }

  ngOnInit() {
    this._rutaActiva.paramMap.subscribe(data => {
      this.idActiva = data.get("IdUsuario")!;

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
}
