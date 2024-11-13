import { Component, OnInit } from '@angular/core';
import {  estadisticaService} from '../estadisitca.service';
import { Observable, of} from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-solicitudes-pendientes-oirs',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './solicitudes-pendientes-oirs.component.html',
  styleUrl: './solicitudes-pendientes-oirs.component.scss'
})
export class SolicitudesPendientesOirsComponent {
  constructor(private estadisticaService: estadisticaService) {}
  pendingOirsCount$: Observable<number> = of(0);


  ngOnInit(): void {
    this.pendingOirsCount$ = this.estadisticaService.getPendingOirsCount();
  }

}
