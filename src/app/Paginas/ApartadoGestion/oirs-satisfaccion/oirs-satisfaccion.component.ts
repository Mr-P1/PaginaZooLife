
import {  Component } from '@angular/core';
import {SolicitudesOirsComponent} from '../Oirs-satisfaccion-comentarios/solicitudes-oirs/solicitudes-oirs.component'
import {RecompensasComponent} from '../Oirs-satisfaccion-comentarios/recompensas/recompensas.component'
import {ComentariosAplicacionComponent} from '../Oirs-satisfaccion-comentarios/comentarios-aplicacion/comentarios-aplicacion.component'
import { Grafico1Component } from '../Oirs-satisfaccion-comentarios/grafico1/grafico1.component';


@Component({
  selector: 'app-oirs-satisfaccion',
  standalone: true,
  imports: [SolicitudesOirsComponent,RecompensasComponent,ComentariosAplicacionComponent,Grafico1Component],
  templateUrl: './oirs-satisfaccion.component.html',
  styleUrl: './oirs-satisfaccion.component.scss'
})
export class OirsSatisfaccionComponent {


}
