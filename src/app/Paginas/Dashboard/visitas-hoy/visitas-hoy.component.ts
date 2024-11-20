import { Component, OnInit } from '@angular/core';
import { estadisticaService } from '../estadisitca.service';
import { Observable,of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-visitas-hoy',
  standalone: true,
  imports: [AsyncPipe,RouterLink],
  templateUrl: './visitas-hoy.component.html',
  styleUrl: './visitas-hoy.component.scss'
})
export class VisitasHoyComponent implements OnInit{
  visitasHoy$: Observable<number> = of(0);

  constructor(private estadisticaService: estadisticaService) {}

  ngOnInit(): void {
    this.visitasHoy$ = this.estadisticaService.getVisitsTodayCount();
  }

}
