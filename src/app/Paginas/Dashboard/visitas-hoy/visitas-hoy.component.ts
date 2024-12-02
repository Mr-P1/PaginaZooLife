import { Component, OnInit } from '@angular/core';
import { TriviaRealizadaService } from '../../../data-acces/triviasvisitas.service';
import { Observable,of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-visitas-hoy',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './visitas-hoy.component.html',
  styleUrl: './visitas-hoy.component.scss'
})
export class VisitasHoyComponent implements OnInit{

  triviasRealizadas: number = 0;
  completadas: number = 0;
  noCompletadas: number = 0;
  noRealizadas: number = 0;

  constructor(private ratingService: TriviaRealizadaService) {}

  ngOnInit(): void {
    // Obtener las trivias de esta semana
    this.ratingService.getTriviasEstaSemana().subscribe(data => {
      this.triviasRealizadas = data.triviasRealizadas;
      this.completadas = data.completadas;
      this.noCompletadas = data.noCompletadas;
      this.noRealizadas = data.noRealizadas;
    });
  }

}
