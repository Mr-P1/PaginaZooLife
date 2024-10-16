import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearAnimal, AnimalesService } from '../../../data-acces/animales.service';
import { Router, RouterLink } from '@angular/router';

// Sweetalert2
import Swal from 'sweetalert2';




@Component({
  selector: 'app-crear-animal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './crear-animal.component.html',
  styleUrl: './crear-animal.component.scss'
})
export class CrearAnimalComponent {
  private _formBuilder = inject(FormBuilder)
  private _animalService = inject(AnimalesService)
  private _router = inject(Router);


  loading = signal(false);
  imagenFile: File | null = null; // Almacenar el archivo de imagen seleccionado
  videoFile: File | null = null; // Almacenar el archivo de imagen seleccionado
  audioFile: File | null = null; // Almacenar el archivo de imagen seleccionado


  form = this._formBuilder.group({
    nombre_comun: this._formBuilder.control("", [Validators.required]),
    nombre_cientifico: this._formBuilder.control("", [Validators.required]),
    descripcion_1: this._formBuilder.control("", [Validators.required]),
    descripcion_2: this._formBuilder.control("", [Validators.required]),
    descripcion_3: this._formBuilder.control("", [Validators.required]),
    dato_curioso: this._formBuilder.control("", [Validators.required]),
    precaucion_1: this._formBuilder.control("", [Validators.required]),
    precaucion_2: this._formBuilder.control("", [Validators.required]),
    precaucion_3: this._formBuilder.control("", [Validators.required]),
    peso: this._formBuilder.control("", [Validators.required]),
    unidad_peso: this._formBuilder.control("", [Validators.required]),
    altura: this._formBuilder.control("", [Validators.required]),
    unidad_altura: this._formBuilder.control("", [Validators.required]),
    habitad: this._formBuilder.control("", [Validators.required]),
    zona: this._formBuilder.control("", [Validators.required]),
    dieta: this._formBuilder.control("", [Validators.required]),
    dieta_descripcion: this._formBuilder.control("", [Validators.required]),
    comportamiento: this._formBuilder.control("", [Validators.required]),
    area: this._formBuilder.control("", [Validators.required]),
    clase: this._formBuilder.control("", [Validators.required]), //Especie
    posicion_mapa: this._formBuilder.control("", [Validators.required]),
    cuidados: this._formBuilder.control("", [Validators.required]),
    estado_conservacion: this._formBuilder.control("", [Validators.required]),
    disponibilidad: this._formBuilder.control("", [Validators.required]),
    imagen: this._formBuilder.control("", [Validators.required]),
    video: this._formBuilder.control("", [Validators.required]),
    audio: this._formBuilder.control("", [Validators.required]),

  })

  errorMessage: string | null = null;





  public imagenCargando = false;
  public imagenBase64 = '';



    // Método para cargar la imagen seleccionada
    public cargarFoto(event: Event) {
      const elemento = event.target as HTMLInputElement;
      const archivo = elemento.files ? elemento.files[0] : null;
      if (archivo) {
        this.imagenFile = archivo; // Almacena el archivo de imagen seleccionado
      }
    }


    public cargarVideo(e: Event) {
      const elemento = e.target as HTMLInputElement;
      const archivo = elemento.files ? elemento.files[0] : null;
      if (archivo) {
        this.videoFile = archivo;  // Almacena el archivo de video seleccionado
      }
    }

    public cargarAudio(e: Event) {
      const elemento = e.target as HTMLInputElement;
      const archivo = elemento.files ? elemento.files[0] : null;
      if (archivo) {
        this.audioFile = archivo;  // Almacena el archivo de audio seleccionado
      }
    }


  async submit() {
    console.log(this.form.getRawValue());

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      this.loading.set(true);
      const {
        nombre_comun,
        nombre_cientifico,
        descripcion_1,
        descripcion_2,
        descripcion_3,
        dato_curioso,
        precaucion_1,
        precaucion_2,
        precaucion_3,
        peso,
        unidad_peso,
        altura,
        unidad_altura,
        habitad,
        zona,
        dieta,
        dieta_descripcion,
        comportamiento,
        area,
        clase,
        posicion_mapa,
        cuidados,
        estado_conservacion,
        disponibilidad,
        imagen
      } = this.form.value;



      const animal: CrearAnimal = {
        nombre_comun: nombre_comun!,
        nombre_cientifico: nombre_cientifico!,
        descripcion_1: descripcion_1!,
        descripcion_2: descripcion_2!,
        descripcion_3: descripcion_3!,
        dato_curioso: dato_curioso!,
        precaucion_1: precaucion_1!,
        precaucion_2: precaucion_2!,
        precaucion_3: precaucion_3!,
        peso: `${peso} ${unidad_peso}`,
        altura: `${altura} ${unidad_altura}`,
        dieta: `${dieta}: ${dieta_descripcion}`,  // Altura combinada con la unidad
        habitat: habitad!,
        zona: zona!,
        comportamiento: comportamiento!,
        area:area!,
        estado_conservacion: estado_conservacion!,
        clase: clase!,  // Clase se refiere a la especie
        posicion_mapa: Number(posicion_mapa),
        cuidados: cuidados!,
        disponibilidad: disponibilidad!,
        imagen: ''
      };

      // await this._animalService.create(animal);
      await this._animalService.createAnimal(animal, this.imagenFile!, this.videoFile! , this.audioFile! );
      Swal.fire({
        title: "Listo !",
        text: "Animal agregado correctamente",
        icon: "success",
        backdrop: 'rgba(0, 0, 0, 0.8)',
      });

      this._router.navigate(['/app/animales']);

    }
    catch (error) {
      this.errorMessage = 'Ha ocurrido un problema, revisa los datos ingresados';

    } finally {
      this.loading.set(false);

    }



  }




}
