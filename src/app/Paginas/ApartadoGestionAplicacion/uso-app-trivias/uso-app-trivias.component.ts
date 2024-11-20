import { GraficoCombinadoComponent } from './../graficos/grafico-combinado/grafico-combinado.component';
import {UsuariosAppComponent} from './../graficos/usuarios-app/usuarios-app.component'
import { Component } from '@angular/core';

import {RespuestasTriviaAppComponent} from './../graficos/respuestas-trivia-app/respuestas-trivia-app.component'

@Component({
  selector: 'app-uso-app-trivias',
  standalone: true,
  imports: [GraficoCombinadoComponent,UsuariosAppComponent,RespuestasTriviaAppComponent],
  templateUrl: './uso-app-trivias.component.html',
  styleUrl: './uso-app-trivias.component.scss'
})
export class UsoAppTriviasComponent {

}
