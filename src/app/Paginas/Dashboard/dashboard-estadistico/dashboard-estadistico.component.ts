import { Component } from '@angular/core';

import { PopularidadAnimalComponent } from './../popularidad-animal/popularidad-animal.component';
import {PopularidadPlantaComponent} from '../popularidad-planta/popularidad-planta.component'
import {SolicitudesOirsRecientesComponent} from '../solicitudes-oirs-recientes/solicitudes-oirs-recientes.component'
import {RespuestasTriviaComponent} from '../respuestas-trivia/respuestas-trivia.component'
import {EscaneoAreasHoyComponent} from '../escaneo-areas-hoy/escaneo-areas-hoy.component'
import {PremiosNoReclamadosComponent} from '../premios-no-reclamados/premios-no-reclamados.component'
import {IngresosAppComponent} from '../ingresos-app/ingresos-app.component'
import {VisitasHoyComponent} from '../visitas-hoy/visitas-hoy.component'
import {SolicitudesPendientesOirsComponent} from '../solicitudes-pendientes-oirs/solicitudes-pendientes-oirs.component'
import {SatisfaccionPromedioComponent} from '../satisfaccion-promedio/satisfaccion-promedio.component'
import {GraficoOirsHoyComponent} from '../grafico-oirs-hoy/grafico-oirs-hoy.component'


@Component({
  selector: 'app-dashboard-estadistico',
  standalone: true,
  imports: [PopularidadAnimalComponent,PopularidadPlantaComponent,SolicitudesOirsRecientesComponent,IngresosAppComponent,VisitasHoyComponent,SolicitudesPendientesOirsComponent,SatisfaccionPromedioComponent
    ,RespuestasTriviaComponent,EscaneoAreasHoyComponent,PremiosNoReclamadosComponent,GraficoOirsHoyComponent],
  templateUrl: './dashboard-estadistico.component.html',
  styleUrl: './dashboard-estadistico.component.scss'
})
export class DashboardEstadisticoComponent {

}
