
import {  Component } from '@angular/core';
import {SolicitudesOirsComponent} from '../Oirs-satisfaccion-comentarios/solicitudes-oirs/solicitudes-oirs.component'
import {RecompensasComponent} from '../Oirs-satisfaccion-comentarios/recompensas/recompensas.component'
import {ComentariosAplicacionComponent} from '../Oirs-satisfaccion-comentarios/comentarios-aplicacion/comentarios-aplicacion.component'



@Component({
  selector: 'app-oirs-satisfaccion',
  standalone: true,
  imports: [SolicitudesOirsComponent,RecompensasComponent,ComentariosAplicacionComponent],
  templateUrl: './oirs-satisfaccion.component.html',
  styleUrl: './oirs-satisfaccion.component.scss'
})
export class OirsSatisfaccionComponent {


}
