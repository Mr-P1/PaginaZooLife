import { Routes } from '@angular/router';
import {privateGuard,publicGuard} from './core/auth.guard';
import {BaseComponent} from './Paginas/base/base.component';
import {EventosComponent} from './Paginas/eventos/eventos.component';
import {ListarAnimalesComponent} from './Paginas/listar-animales/listar-animales.component';
import {CrearAnimalComponent} from './Paginas/animal/crear-animal/crear-animal.component';
import {ModificarAnimalComponent} from './Paginas/animal/modificar-animal/modificar-animal.component';
import {EstadisticasComponent} from './Paginas/estadisticas/estadisticas.component';
import { MapaComponent } from './Paginas/mapa/mapa.component';


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
      { path:'modificar_animal/:idAnimal',component:ModificarAnimalComponent},
      { path:'estadisticas',component:EstadisticasComponent},
      { path:'mapa',component:MapaComponent},


    ],
  },
  {
      path:'**',
      redirectTo:''
    },



];
