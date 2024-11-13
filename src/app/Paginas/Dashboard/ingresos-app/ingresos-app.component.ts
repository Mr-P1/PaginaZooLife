import { Component, OnInit } from '@angular/core';
import { estadisticaService } from '../estadisitca.service';
import { Observable,of } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-ingresos-app',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './ingresos-app.component.html',
  styleUrl: './ingresos-app.component.scss'
})
export class IngresosAppComponent implements OnInit {

  ingresosHoy$: Observable<number> = of(0);

  constructor(private estadisticaService: estadisticaService) {}

  ngOnInit(): void {
    this.ingresosHoy$ = this.estadisticaService.getAppIngressCount();
  }

}
