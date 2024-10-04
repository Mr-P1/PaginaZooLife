import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnimalesService, Animal } from '../../../data-acces/animales.service';
import {  Respuestas, CrearPregunta, PreguntaService } from '../../../data-acces/preguntas.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';


// Sweetalert2
import Swal from 'sweetalert2';



@Component({
  selector: 'app-modificar-preguntas',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './modificar-preguntas.component.html',
  styleUrl: './modificar-preguntas.component.scss'
})
export class ModificarPreguntasComponent implements OnInit {
  errorMessage: string | null = null;
  successMessage: string | null = null;
  public idActiva = "";



  private _formBuilder = inject(FormBuilder);
  private _rutaActiva = inject(ActivatedRoute);
  private _animalService = inject(AnimalesService);
  private _preguntaService = inject(PreguntaService);
  private _router = inject(Router)
  animales$: Observable<Animal[]> | null = null;  // Observable para obtener los animales


  loading = signal(false);
  loading2 = signal(false);

  form = this._formBuilder.group({
    pregunta: this._formBuilder.control("", [Validators.required]),
    respuesta_1: this._formBuilder.control("", [Validators.required]),
    respuesta_2: this._formBuilder.control("", [Validators.required]),
    respuesta_3: this._formBuilder.control("", [Validators.required]),
    respuesta_4: this._formBuilder.control("", [Validators.required]),
    respuesta_correcta: this._formBuilder.control("", [Validators.required]),
    tipo: this._formBuilder.control("", [Validators.required]),
    animal_id: this._formBuilder.control("", [Validators.required]),  // Aquí se seleccionará el animal
  });


  ngOnInit() {
    // Cargar los animales desde el servicio
    this.animales$ = this._animalService.getAnimales();


    this._rutaActiva.paramMap.subscribe(parametros => {
      this.idActiva = parametros.get("idPregunta")!;

      this._preguntaService.getPregunta(this.idActiva).subscribe(pregunta => {
        if (pregunta) {
          this.form.patchValue({
            pregunta: pregunta.pregunta ,
            respuesta_1: pregunta.respuestas.a ,
            respuesta_2:  pregunta.respuestas.b,
            respuesta_3:  pregunta.respuestas.c,
            respuesta_4:  pregunta.respuestas.d,
            respuesta_correcta:  pregunta.respuesta_correcta,
            tipo:  pregunta.tipo,
            animal_id:  pregunta.animal_id,
          });
        } else {
          this.errorMessage = "Pregunta no encontrada.";
        }
      });
    });
  }

  async actualizar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log(this.form.value)

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas actualizar la información de la pregunta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    });

    if (result.isConfirmed) {
      try {
        this.loading.set(true);

        const respuestas: Respuestas = {
          a: this.form.get('respuesta_1')?.value !,
          b: this.form.get('respuesta_2')?.value!,
          c: this.form.get('respuesta_3')?.value!,
          d: this.form.get('respuesta_4')?.value!,
        };

        const preguntaTrivia: CrearPregunta = {
          pregunta: this.form.get('pregunta')?.value!,
          respuestas: respuestas,
          respuesta_correcta: this.form.get('respuesta_correcta')?.value!,
          tipo: this.form.get('tipo')?.value!,
          animal_id: this.form.get('animal_id')?.value!,  // Seleccionamos el id del animal
        };


        await this._preguntaService.editarPregunta(this.idActiva, preguntaTrivia);

        Swal.fire({
          title: "Listo!",
          text: "La pregunta ha sido modificado correctamente",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });
        this._router.navigate(['/app/preguntas']);

      } catch (error) {
        this.errorMessage = 'Ha ocurrido un problema, revisa los datos ingresados';
      } finally {
        this.loading.set(false);
      }
    }
  }



  async borrarPregunta() {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la pregunta',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    });

    if (result.isConfirmed) {
      try {
        this.loading2.set(true);
        await this._preguntaService.eliminarPregunta(this.idActiva);

        Swal.fire({
          title: "Listo!",
          text: "Pregunta eliminada",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });

        this._router.navigate(['/app/preguntas']);
      } catch (error) {
        this.errorMessage = 'Ha ocurrido un problema inesperado, vuelva a intentarlo';
      } finally {
        this.loading2.set(false);
      }
    }
  }






}
