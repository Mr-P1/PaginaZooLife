import { Component, OnInit } from '@angular/core';
import {  estadisticaService} from '../estadisitca.service';
import { Observable,of } from 'rxjs';
import { AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-satisfaccion-promedio',
  standalone: true,
  imports: [AsyncPipe, DecimalPipe],
  templateUrl: './satisfaccion-promedio.component.html',
  styleUrl: './satisfaccion-promedio.component.scss'
})
export class SatisfaccionPromedioComponent implements OnInit{

  averageRating$: Observable<number> = of(0);

  constructor(private estadisticaService: estadisticaService) {}

  ngOnInit(): void {
    this.averageRating$ = this.estadisticaService.getAverageRating();
  }

}
