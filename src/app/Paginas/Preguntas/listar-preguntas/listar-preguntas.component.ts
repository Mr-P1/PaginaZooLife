import { Component, OnInit } from '@angular/core';
import { Animal, AnimalesService } from '../../../data-acces/animales.service';
import { Observable, forkJoin, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PreguntaService, PreguntaTrivia } from '../../../data-acces/preguntas.service';
import { FormsModule } from '@angular/forms';

interface PreguntaConAnimal {
  pregunta: PreguntaTrivia;
  animal: Animal | null;
}

@Component({
  selector: 'app-listar-preguntas',
  templateUrl: './listar-preguntas.component.html',
  styleUrls: ['./listar-preguntas.component.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
})
export class ListarPreguntasComponent implements OnInit {
  preguntasConAnimales$: Observable<PreguntaConAnimal[]> | null = null;
  lastVisible: any = null;
  firstVisible: any = null;
  pageSize = 5;
  currentPage = 1;
  loading = false;
  searchTerm: string = ''; // Variable para almacenar el término de búsqueda

  // Pila para almacenar las referencias a los documentos de las páginas anteriores
  pageStack: { firstVisible: any, lastVisible: any }[] = [];

  constructor(
    private animalesService: AnimalesService,
    private preguntasService: PreguntaService
  ) {}

  ngOnInit() {
    this.loadInitialPage();
  }

  // Cargar la primera página de preguntas con animales
  loadInitialPage() {
    this.loading = true;
    // Convertimos la promesa en un observable usando 'from'
    this.preguntasConAnimales$ = from(this.preguntasService.getPreguntasPaginadas(this.pageSize)).pipe(
      switchMap(data => {
        this.lastVisible = data.lastVisible;
        this.firstVisible = data.firstVisible;
        this.pageStack.push({ firstVisible: this.firstVisible, lastVisible: this.lastVisible });

        const preguntas = data.preguntas;
        const animalRequests = preguntas.map((pregunta: PreguntaTrivia) =>
          this.animalesService.getAnimal(pregunta.animal_id).pipe(
            map(animal => ({ pregunta, animal }))
          )
        );

        this.loading = false;
        return forkJoin(animalRequests);
      })
    );
  }

  // Cargar la siguiente página de preguntas con animales
  loadNextPage() {
    if (this.lastVisible) {
      this.loading = true;
      // Convertimos la promesa en un observable usando 'from'
      this.preguntasConAnimales$ = from(this.preguntasService.getPreguntasPaginadas(this.pageSize, this.lastVisible)).pipe(
        switchMap(data => {
          this.lastVisible = data.lastVisible;
          this.firstVisible = data.firstVisible;
          this.pageStack.push({ firstVisible: this.firstVisible, lastVisible: this.lastVisible });
          this.currentPage += 1;

          const preguntas = data.preguntas;
          const animalRequests = preguntas.map((pregunta: PreguntaTrivia) =>
            this.animalesService.getAnimal(pregunta.animal_id).pipe(
              map(animal => ({ pregunta, animal }))
            )
          );

          this.loading = false;
          return forkJoin(animalRequests);
        })
      );
    }
  }

  // Cargar la página anterior de preguntas con animales
  loadPreviousPage() {
    if (this.currentPage > 1) {
      this.pageStack.pop();
      const previousPage = this.pageStack[this.pageStack.length - 1];

      if (previousPage) {
        this.loading = true;
        // Convertimos la promesa en un observable usando 'from'
        this.preguntasConAnimales$ = from(this.preguntasService.getPreguntasPaginadasAnterior(this.pageSize, previousPage.firstVisible)).pipe(
          switchMap(data => {
            this.lastVisible = data.lastVisible;
            this.firstVisible = previousPage.firstVisible;
            this.currentPage -= 1;

            const preguntas = data.preguntas;
            const animalRequests = preguntas.map((pregunta: PreguntaTrivia) =>
              this.animalesService.getAnimal(pregunta.animal_id).pipe(
                map(animal => ({ pregunta, animal }))
              )
            );

            this.loading = false;
            return forkJoin(animalRequests);
          })
        );
      }
    }
  }

  // Manejar cambios en el campo de búsqueda
  onSearchChange(event: any) {
    const searchTerm = event.target.value.trim();

    if (searchTerm) {
      this.loading = true;
      this.preguntasService.buscarPreguntas(searchTerm).then(preguntas => {
        const animalRequests = preguntas.map((pregunta: PreguntaTrivia) =>
          this.animalesService.getAnimal(pregunta.animal_id).pipe(
            map(animal => ({ pregunta, animal }))
          )
        );

        forkJoin(animalRequests).subscribe(preguntasConAnimales => {
          this.preguntasConAnimales$ = new Observable(subscriber => {
            subscriber.next(preguntasConAnimales);
            subscriber.complete();
          });
          this.loading = false;
        });
      });
    } else {
      this.loadInitialPage(); // Volver a la paginación cuando no haya búsqueda
    }
  }
}
