import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearPlanta, PlantaService } from '../../../data-acces/bioparque.service';
import { Router, RouterLink } from '@angular/router';

// Sweetalert2
import Swal from 'sweetalert2';


@Component({
  selector: 'app-crear-bioparque',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './crear-bioparque.component.html',
  styleUrl: './crear-bioparque.component.scss'
})
export class CrearBioparqueComponent {
  private _formBuilder = inject(FormBuilder);
  private _plantaService = inject(PlantaService);  // Cambié a `PlantaService`
  private _router = inject(Router);

  loading = signal(false);
  imagenFile: File | null = null; // Almacenar el archivo de imagen seleccionado
  videoFile: File | null = null; // Almacenar el archivo de video seleccionado
  audioFile: File | null = null; // Almacenar el archivo de audio seleccionado
  errorMessage: string | null = null;

  form = this._formBuilder.group({
    nombre_comun: this._formBuilder.control("", [Validators.required]),
    nombre_cientifico: this._formBuilder.control("", [Validators.required]),
    familia: this._formBuilder.control("", [Validators.required]),
    area: this._formBuilder.control("", [Validators.required]),
    altura: this._formBuilder.control(0, [Validators.required]),
    altura_formato: this._formBuilder.control("", [Validators.required]),
    peso: this._formBuilder.control(0, [Validators.required]),
    peso_formato: this._formBuilder.control("", [Validators.required]),
    descripcion_1: this._formBuilder.control("", [Validators.required]),
    descripcion_2: this._formBuilder.control("", [Validators.required]),
    descripcion_3: this._formBuilder.control("", [Validators.required]),
    zonas: this._formBuilder.control("", [Validators.required]),
    cuidados: this._formBuilder.control("", [Validators.required]),
    floracion: this._formBuilder.control("", [Validators.required]),
    importancia: this._formBuilder.control("", [Validators.required]),
    estado: this._formBuilder.control("", [Validators.required]),
    curiosidad: this._formBuilder.control("", [Validators.required]),
    precaucion: this._formBuilder.control("", [Validators.required]),
    usos: this._formBuilder.control("", [Validators.required]),
    posicion_mapa: this._formBuilder.control(0, [Validators.required]),
    imagen: this._formBuilder.control("", [Validators.required]),
    video: this._formBuilder.control("", [Validators.required]),
    audio: this._formBuilder.control("", [Validators.required])
  });

  // Método para cargar la imagen seleccionada
  public cargarFoto(event: Event) {
    const elemento = event.target as HTMLInputElement;
    const archivo = elemento.files ? elemento.files[0] : null;
    if (archivo) {
      this.imagenFile = archivo; // Almacena el archivo de imagen seleccionado
    }
  }

  // Método para cargar el video seleccionado
  public cargarVideo(event: Event) {
    const elemento = event.target as HTMLInputElement;
    const archivo = elemento.files ? elemento.files[0] : null;
    if (archivo) {
      this.videoFile = archivo;  // Almacena el archivo de video seleccionado
    }
  }

  // Método para cargar el audio seleccionado
  public cargarAudio(event: Event) {
    const elemento = event.target as HTMLInputElement;
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
        familia,
        altura,
        altura_formato,
        peso,
        peso_formato,
        descripcion_1,
        descripcion_2,
        descripcion_3,
        zonas,
        cuidados,
        floracion,
        importancia,
        estado,
        curiosidad,
        precaucion,
        usos,
        posicion_mapa,
        area
      } = this.form.value;

      const planta: CrearPlanta = {
        nombre_comun: nombre_comun!,
        nombre_cientifico: nombre_cientifico!,
        familia: familia!,
        area:String(area),
        altura:  `${altura} ${altura_formato}`,
        peso:  `${peso} ${peso_formato}`,
        usos:usos!,
        posicion_mapa:posicion_mapa!,
        descripcion_1: descripcion_1!,
        descripcion_2: descripcion_2 || '',
        descripcion_3: descripcion_3 || '',
        zonas: zonas!,
        imagen: '',  // Se asigna más adelante tras la subida
        video: '',   // Se asigna más adelante tras la subida
        audio: '',   // Se asigna más adelante tras la subida
        cuidados: cuidados!,
        floracion: floracion!,
        importancia: importancia!,
        estado: estado!,
        curiosidad: curiosidad || '',
        precaucion: precaucion || ''
      };

      await this._plantaService.createPlanta(planta, this.imagenFile!, this.videoFile!, this.audioFile!);
      Swal.fire({
        title: "¡Listo!",
        text: "Planta agregada correctamente",
        icon: "success",
        backdrop: 'rgba(0, 0, 0, 0.8)',
      });

      this._router.navigate(['/app/plantas']);  // Redirige a la lista de plantas

    } catch (error) {
      this.errorMessage = 'Ha ocurrido un problema, revisa los datos ingresados';
    } finally {
      this.loading.set(false);
    }
  }


}
