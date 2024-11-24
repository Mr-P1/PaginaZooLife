import { Component, OnInit } from '@angular/core';
import { Animal, AnimalesService } from '../../../data-acces/animales.service';
import { Observable, forkJoin, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PreguntaService, PreguntaTrivia, PreguntaTriviaPlantas } from '../../../data-acces/preguntas.service';
import { FormsModule } from '@angular/forms';
import { PlantaService, Planta } from '../../../data-acces/bioparque.service';

interface PreguntaConEspecie {
  pregunta: PreguntaTrivia | PreguntaTriviaPlantas;
  especie: Animal | Planta | null;
}

type PreguntaUnificada = PreguntaTrivia | PreguntaTriviaPlantas;


@Component({
  selector: 'app-listar-preguntas',
  templateUrl: './listar-preguntas.component.html',
  styleUrls: ['./listar-preguntas.component.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
})
export class ListarPreguntasComponent implements OnInit {
  preguntasConEspecies$: Observable<PreguntaConEspecie[]> | null = null;
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
    private plantasService: PlantaService,
    private preguntasService: PreguntaService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadInitialPage();
  }

  // Cargar la primera página de preguntas
  loadInitialPage() {
    this.loading = true;
    this.preguntasConEspecies$ = from(this.preguntasService.getPreguntasPaginadas(this.pageSize)).pipe(
      switchMap(data => {
        this.lastVisible = data.lastVisible;
        this.firstVisible = data.firstVisible;
        this.pageStack = [{ firstVisible: this.firstVisible, lastVisible: this.lastVisible }];

        const preguntas = data.preguntas;
        const especieRequests = preguntas.map((pregunta: PreguntaTrivia | PreguntaTriviaPlantas) => {
          if ('animal_id' in pregunta) {
            return this.animalesService.getAnimal(pregunta.animal_id).pipe(
              map(animal => ({ pregunta, especie: animal }))
            );
          } else if ('planta_id' in pregunta) {
            return this.plantasService.getPlanta(pregunta.planta_id).pipe(
              map(planta => ({ pregunta, especie: planta }))
            );
          }
          return null;
        }).filter(request => request !== null) as Observable<PreguntaConEspecie>[];

        this.loading = false;
        return forkJoin(especieRequests);
      })
    );
  }

  // Cargar la siguiente página
  loadNextPage() {
    if (this.lastVisible) {
      this.loading = true;
      this.preguntasConEspecies$ = from(this.preguntasService.getPreguntasPaginadas(this.pageSize, this.lastVisible)).pipe(
        switchMap(data => {
          this.lastVisible = data.lastVisible;
          this.firstVisible = data.firstVisible;
          this.pageStack.push({ firstVisible: this.firstVisible, lastVisible: this.lastVisible });
          this.currentPage += 1;

          const preguntas = data.preguntas;
          const especieRequests = preguntas.map((pregunta: PreguntaTrivia | PreguntaTriviaPlantas) => {
            if ('animal_id' in pregunta) {
              return this.animalesService.getAnimal(pregunta.animal_id).pipe(
                map(animal => ({ pregunta, especie: animal }))
              );
            } else if ('planta_id' in pregunta) {
              return this.plantasService.getPlanta(pregunta.planta_id).pipe(
                map(planta => ({ pregunta, especie: planta }))
              );
            }
            return null;
          }).filter(request => request !== null) as Observable<PreguntaConEspecie>[];

          this.loading = false;
          return forkJoin(especieRequests);
        })
      );
    }
  }

  // Cargar la página anterior
  loadPreviousPage() {
    if (this.currentPage > 1) {
      this.pageStack.pop();
      const previousPage = this.pageStack[this.pageStack.length - 1];

      if (previousPage) {
        this.loading = true;
        this.preguntasConEspecies$ = from(this.preguntasService.getPreguntasPaginadasAnterior(this.pageSize, previousPage.firstVisible)).pipe(
          switchMap(data => {
            this.lastVisible = data.lastVisible;
            this.firstVisible = previousPage.firstVisible;
            this.currentPage -= 1;

            const preguntas = data.preguntas;
            const especieRequests = preguntas.map((pregunta: PreguntaTrivia | PreguntaTriviaPlantas) => {
              if ('animal_id' in pregunta) {
                return this.animalesService.getAnimal(pregunta.animal_id).pipe(
                  map(animal => ({ pregunta, especie: animal }))
                );
              } else if ('planta_id' in pregunta) {
                return this.plantasService.getPlanta(pregunta.planta_id).pipe(
                  map(planta => ({ pregunta, especie: planta }))
                );
              }
              return null;
            }).filter(request => request !== null) as Observable<PreguntaConEspecie>[];

            this.loading = false;
            return forkJoin(especieRequests);
          })
        );
      }
    }
  }

  onSearchChange(event: any) {
    const term = this.searchTerm.toLowerCase();  // Convertir el término de búsqueda a minúsculas para no ser sensible a mayúsculas

    // Si ya tenemos las preguntas cargadas
    if (this.preguntasConEspecies$) {
      this.preguntasConEspecies$ = from(this.preguntasService.getPreguntasPaginadas(this.pageSize)).pipe(
        switchMap(data => {
          this.lastVisible = data.lastVisible;
          this.firstVisible = data.firstVisible;
          this.pageStack = [{ firstVisible: this.firstVisible, lastVisible: this.lastVisible }];
          const preguntas = data.preguntas;

          // Filtrar las preguntas según el término de búsqueda
          const filteredQuestions = preguntas.filter((pregunta: PreguntaTrivia | PreguntaTriviaPlantas) => {
            // Filtrar si el texto de la pregunta o alguna de sus respuestas contiene el término de búsqueda
            const preguntaTexto = pregunta.pregunta.toLowerCase();
            const respuestaCorrectaTexto = pregunta.respuestas[pregunta.respuesta_correcta]?.toLowerCase();

            // Devuelve true si alguna de las cadenas contiene el término de búsqueda
            return preguntaTexto.includes(term) || (respuestaCorrectaTexto && respuestaCorrectaTexto.includes(term));
          });

          const especieRequests = filteredQuestions.map((pregunta: PreguntaTrivia | PreguntaTriviaPlantas) => {
            if ('animal_id' in pregunta) {
              return this.animalesService.getAnimal(pregunta.animal_id).pipe(
                map(animal => ({ pregunta, especie: animal }))
              );
            } else if ('planta_id' in pregunta) {
              return this.plantasService.getPlanta(pregunta.planta_id).pipe(
                map(planta => ({ pregunta, especie: planta }))
              );
            }
            return null;
          }).filter(request => request !== null) as Observable<PreguntaConEspecie>[];

          this.loading = false;
          return forkJoin(especieRequests);
        })
      );
    }
  }

    // Método navigateToEdit
    navigateToEdit(item: PreguntaConEspecie) {
      if ('animal_id' in item.pregunta) {
        // Si la pregunta es sobre un animal
        this.router.navigate(['/app/modificar_pregunta', item.pregunta.id]);
      } else if ('planta_id' in item.pregunta) {
        // Si la pregunta es sobre una planta
        this.router.navigate(['/app/modificar_pregunta_planta', item.pregunta.id]);
      }
    }
}
