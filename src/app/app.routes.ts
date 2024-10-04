import { Routes } from '@angular/router';
import {privateGuard,publicGuard} from './core/auth.guard';
import {BaseComponent} from './Paginas/base/base.component';
import {EventosComponent} from './Paginas/evento/eventos/eventos.component';
import {ListarAnimalesComponent} from './Paginas/animal/listar-animales/listar-animales.component';
import {CrearAnimalComponent} from './Paginas/animal/crear-animal/crear-animal.component';
import {ModificarAnimalComponent} from './Paginas/animal/modificar-animal/modificar-animal.component';
import {EstadisticasComponent} from './Paginas/estadisticas/estadisticas.component';
import { MapaComponent } from './Paginas/mapa/mapa.component';
import { CrearEventoComponent } from './Paginas/evento/crear-evento/crear-evento.component';
import { ModificarEventoComponent } from './Paginas/evento/modificar-evento/modificar-evento.component';
import { CrearPreguntasComponent } from './Paginas/Preguntas/crear-preguntas/crear-preguntas.component';
import { ListarPreguntasComponent } from './Paginas/Preguntas/listar-preguntas/listar-preguntas.component';
import { ModificarPreguntasComponent } from './Paginas/Preguntas/modificar-preguntas/modificar-preguntas.component';
import {DashboardComponent} from './Paginas/Prueba/dashboard/dashboard.component';
import { CrearPremiosTriviaComponent } from './Paginas/premios-trivia/crear-premios-trivia/crear-premios-trivia.component';
import { ListarPremiosTriviaComponent } from './Paginas/premios-trivia/listar-premios-trivia/listar-premios-trivia.component';
import { ModificarPremiosTriviaComponent } from './Paginas/premios-trivia/modificar-premios-trivia/modificar-premios-trivia.component';
import { ListarBioparqueComponent } from './Paginas/bioparque/listar-bioparque/listar-bioparque.component';
import { CrearBioparqueComponent } from './Paginas/bioparque/crear-bioparque/crear-bioparque.component';
import { ModificarBioparqueComponent } from './Paginas/bioparque/modificar-bioparque/modificar-bioparque.component';

export const routes: Routes = [

  {
    canActivate:[publicGuard()],
    path:'',
    loadComponent: () => import('./Paginas/login/login.component').then(m => m.LoginComponent)
  },
  {
    canActivate:[privateGuard()],
    path: 'app',
    component: BaseComponent,
    children: [
      { path: 'animales', component: ListarAnimalesComponent },
      { path: 'eventos', component: EventosComponent },
      { path:'crear_animal',component:CrearAnimalComponent},
      { path:'crear_evento',component:CrearEventoComponent},
      { path:'modificar_animal/:idAnimal',component:ModificarAnimalComponent},
      { path:'modificar_evento',component:ModificarEventoComponent},
      { path:'estadisticas',component:EstadisticasComponent},
      { path:'mapa',component:MapaComponent},
      { path:'preguntas',component:ListarPreguntasComponent},
      { path:'crear_pregunta',component:CrearPreguntasComponent},
      { path:'modificar_pregunta/:idPregunta',component:ModificarPreguntasComponent},
      { path:'dashboard',component:DashboardComponent},
      { path:'premios',component:ListarPremiosTriviaComponent},
      { path:'crear_premio',component:CrearPremiosTriviaComponent},
      { path:'modificar_premio/:idPremio',component:ModificarPremiosTriviaComponent},
      { path:'bioparque',component:ListarBioparqueComponent},
      { path:'crear_bioparque',component:CrearBioparqueComponent},
      { path:'modificar_bioparque/:idBioparque',component:ModificarBioparqueComponent},



    ],
  },
  {
      path:'**',
      redirectTo:''
    },



];
