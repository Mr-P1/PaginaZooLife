import { Routes } from '@angular/router';
import {privateGuard,publicGuard} from './core/auth.guard';
import {BaseComponent} from './Paginas/base/base.component';
import {ListarEventosComponent} from './Paginas/evento/eventos/eventos.component';
import {ListarAnimalesComponent} from './Paginas/animal/listar-animales/listar-animales.component';
import {CrearAnimalComponent} from './Paginas/animal/crear-animal/crear-animal.component';
import {ModificarAnimalComponent} from './Paginas/animal/modificar-animal/modificar-animal.component';
import {EstadisticasComponent} from './Paginas/Estadistica/estadisticas/estadisticas.component';
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
import { ListarNoticiaComponent } from './Paginas/Noticias/listar-noticia/listar-noticia.component';
import { CrearNoticiaComponent } from './Paginas/Noticias/crear-noticia/crear-noticia.component';
import { ModificarNoticiaComponent } from './Paginas/Noticias/modificar-noticia/modificar-noticia.component';
import { ListarUsuariosComponent } from './Paginas/Usuarios/listar-usuarios/listar-usuarios.component';
import { VerMasComponent } from './Paginas/Usuarios/ver-mas/ver-mas.component';
import {UsoAplicacionComponent} from './Paginas/Estadistica/uso-aplicacion/uso-aplicacion.component';
import { RespuestasTriviaComponent } from './Paginas/Estadistica/respuestas-trivia/respuestas-trivia.component';
import { AreasVisitadasComponent } from './Paginas/Estadistica/areas-visitadas/areas-visitadas.component';
import { ChatComponent } from './Paginas/Usuarios/chat/chat.component';
import { GenerarCodigoComponent } from './Paginas/generar-codigo/generar-codigo.component';
import { OirsConsultaComponent } from './Paginas/Oirs/oirs-consulta/oirs-consulta.component';
import { OirsFelicitacionComponent } from './Paginas/Oirs/oirs-felicitacion/oirs-felicitacion.component';
import { OirsReclamoComponent } from './Paginas/Oirs/oirs-reclamo/oirs-reclamo.component';
import { OirsSugerenciaComponent } from './Paginas/Oirs/oirs-sugerencia/oirs-sugerencia.component';
import { CrearPreguntasPlantasComponent } from './Paginas/Preguntas/crear-preguntas-plantas/crear-preguntas-plantas.component';
import { ModificarPreguntasPlantasComponent } from './Paginas/Preguntas/modificar-preguntas-plantas/modificar-preguntas-plantas.component';
import { DashboardEstadisticoComponent } from './Paginas/Dashboard/dashboard-estadistico/dashboard-estadistico.component';
import { OirsSatisfaccionComponent } from './Paginas/ApartadoGestion/oirs-satisfaccion/oirs-satisfaccion.component';

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
      { path: 'eventos', component: ListarEventosComponent },
      { path:'crear_animal',component:CrearAnimalComponent},
      { path:'crear_evento',component:CrearEventoComponent},
      { path:'modificar_animal/:idAnimal',component:ModificarAnimalComponent},
      { path:'modificar_evento/:idEvento',component:ModificarEventoComponent},
      { path:'mapa',component:MapaComponent},
      { path:'preguntas',component:ListarPreguntasComponent},
      { path:'crear_pregunta',component:CrearPreguntasComponent},
      { path:'modificar_pregunta/:idPregunta',component:ModificarPreguntasComponent},
      { path:'premios',component:ListarPremiosTriviaComponent},
      { path:'crear_premio',component:CrearPremiosTriviaComponent},
      { path:'modificar_premio/:idPremio',component:ModificarPremiosTriviaComponent},
      { path:'plantas',component:ListarBioparqueComponent},
      { path:'crear_bioparque',component:CrearBioparqueComponent},
      { path:'modificar_bioparque/:idBioparque',component:ModificarBioparqueComponent},
      { path:'noticias',component:ListarNoticiaComponent},
      { path:'crear_noticia',component:CrearNoticiaComponent},
      { path:'modificar_noticia/:idNoticia',component:ModificarNoticiaComponent},
      { path:'usuarios',component:ListarUsuariosComponent},
      { path:'ver_mas/:IdUsuario',component:VerMasComponent},
      { path:'generar-codigo',component:GenerarCodigoComponent},
      {path:'crear_pregunta_planta',component:CrearPreguntasPlantasComponent},
      { path:'modificar_pregunta_planta/:idPregunta',component:ModificarPreguntasPlantasComponent},


      { path:'estadisticas2',component:EstadisticasComponent},
      {path:'oirs-consulta',component:OirsConsultaComponent},
      {path:'oirs-felicitacion',component:OirsFelicitacionComponent},
      {path:'oirs-reclamo',component:OirsReclamoComponent},
      {path:'oirs-sugerencia',component:OirsSugerenciaComponent},
      { path:'chat/:IdUsuario',component:ChatComponent},
      { path:'areas-visitadas',component:AreasVisitadasComponent},
      { path:'uso_aplicacion',component:UsoAplicacionComponent},
      { path:'respuestas_trivia',component:RespuestasTriviaComponent},


      { path:'prueba',component:DashboardComponent},

      { path:'estadisticas',component:DashboardEstadisticoComponent},
      {path:'oirs-rating-satisfaccion',component:OirsSatisfaccionComponent}
    ],
  },
  {
      path:'**',
      redirectTo:''
    },



];
