import { Routes } from '@angular/router';
import {privateGuard,publicGuard} from './core/auth.guard';
import {BaseComponent} from './Paginas/base/base.component';
import {EventosComponent} from './Paginas/eventos/eventos.component';
import {ListarAnimalesComponent} from './Paginas/listar-animales/listar-animales.component';
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
      { path:'dashboard',component:DashboardComponent}


    ],
  },
  {
      path:'**',
      redirectTo:''
    },



];
