import { Component, OnInit } from '@angular/core';
import { AnimalesService, PreguntaTrivia, Animal } from '../../../data-acces/animales.service';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface PreguntaConAnimal {
  pregunta: PreguntaTrivia;
  animal: Animal | null;
}

@Component({
  selector: 'app-listar-preguntas',
  templateUrl: './listar-preguntas.component.html',
  styleUrls: ['./listar-preguntas.component.scss'],
  standalone:true,
  imports: [CommonModule, RouterModule],
})
export class ListarPreguntasComponent implements OnInit {
  preguntasConAnimales$: Observable<PreguntaConAnimal[]> | null = null;

  constructor(private animalesService: AnimalesService) {}

  ngOnInit() {
    // Obtener las preguntas de trivia y mapearlas con sus respectivos animales
    this.preguntasConAnimales$ = this.animalesService.getPreguntas().pipe(
      switchMap(preguntas => {
        const animalRequests = preguntas.map(pregunta =>
          this.animalesService.getAnimal(pregunta.animal_id).pipe(
            map(animal => ({ pregunta, animal }))
          )
        );
        return forkJoin(animalRequests);
      })
    );
  }
}

