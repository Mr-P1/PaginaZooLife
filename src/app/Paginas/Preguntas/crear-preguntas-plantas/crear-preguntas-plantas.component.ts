import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PlantaService, Planta } from '../../../data-acces/bioparque.service';
import {  Respuestas, CrearPreguntaPlanta, PreguntaService } from '../../../data-acces/preguntas.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-preguntas-plantas',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './crear-preguntas-plantas.component.html',
  styleUrl: './crear-preguntas-plantas.component.scss'
})
export class CrearPreguntasPlantasComponent {
  private _formBuilder = inject(FormBuilder);
  private _plantasService = inject(PlantaService);
  private _preguntaService = inject(PreguntaService);
  private _router = inject(Router);

  loading = signal(false);
  plantas$: Observable<Planta[]> | null = null;  // Observable para obtener los animales

  form = this._formBuilder.group({
    pregunta: this._formBuilder.control("", [Validators.required]),
    respuesta_1: this._formBuilder.control("", [Validators.required]),
    respuesta_2: this._formBuilder.control("", [Validators.required]),
    respuesta_3: this._formBuilder.control("", [Validators.required]),
    respuesta_4: this._formBuilder.control("", [Validators.required]),
    respuesta_correcta: this._formBuilder.control("", [Validators.required]),
    tipo: this._formBuilder.control("", [Validators.required]),
    planta_id: this._formBuilder.control("", [Validators.required]),  // Aquí se seleccionará el animal
  });

  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit() {
    // Cargar los animales desde el servicio
    this.plantas$ = this._plantasService.getAnimales();
  }

  async submit() {
    console.log(this.form.value)
    if (this.form.invalid) {
      this.errorMessage = "Por favor completa todos los campos.";
      return;
    }

    this.loading.set(true);
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const respuestas: Respuestas = {
        a: this.form.get('respuesta_1')?.value !,
        b: this.form.get('respuesta_2')?.value!,
        c: this.form.get('respuesta_3')?.value!,
        d: this.form.get('respuesta_4')?.value!,
      };

      const preguntaTrivia: CrearPreguntaPlanta = {
        pregunta: this.form.get('pregunta')?.value!,
        respuestas: respuestas,
        respuesta_correcta: this.form.get('respuesta_correcta')?.value!,
        tipo: this.form.get('tipo')?.value!,
        planta_id: this.form.get('planta_id')?.value!,  // Seleccionamos el id del animal
      };

      await this._preguntaService.createPreguntaTriviaPlantas(preguntaTrivia);

      Swal.fire({
        title: "Listo !",
        text: "Pregunta agregada correctamente",
        icon: "success",
        backdrop: 'rgba(0, 0, 0, 0.8)',
      });
      this._router.navigate(['/app/preguntas']);

    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error !",
        text: "Ha ocurrido un problema inesperado",
        icon: "error",
        backdrop: 'rgba(0, 0, 0, 0.8)',
      });
    } finally {
      this.loading.set(false);
    }
  }

}
