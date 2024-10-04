import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearPremioTrivia, PremiosService } from '../../../data-acces/premios.service';
import { Router, RouterLink } from '@angular/router';

// Sweetalert2
import Swal from 'sweetalert2';


@Component({
  selector: 'app-crear-premios-trivia',
  standalone: true,
  imports:  [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './crear-premios-trivia.component.html',
  styleUrl: './crear-premios-trivia.component.scss'
})
export class CrearPremiosTriviaComponent {
  private _formBuilder = inject(FormBuilder)
  private _premioService = inject(PremiosService)
  private _router = inject(Router);

  loading = signal(false);
  imagenFile: File | null = null; // Almacenar el archivo de imagen seleccionado
  errorMessage: string | null = null;


  form = this._formBuilder.group({
    nombre: this._formBuilder.control("", [Validators.required]),
    descripcion: this._formBuilder.control("", [Validators.required]),
    cantidad: this._formBuilder.control(0, [Validators.required]),
    puntos_necesarios: this._formBuilder.control(0, [Validators.required]),
    imagen: this._formBuilder.control("", [Validators.required]),
  })

  // Método para cargar la imagen seleccionada
  public cargarFoto(event: Event) {
    const elemento = event.target as HTMLInputElement;
    const archivo = elemento.files ? elemento.files[0] : null;
    if (archivo) {
      this.imagenFile = archivo; // Almacena el archivo de imagen seleccionado
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
        nombre,
        descripcion,
        cantidad,
        puntos_necesarios

      } = this.form.value;



      const premio: CrearPremioTrivia = {
       nombre:nombre !,
       descripcion:descripcion!,
       cantidad:Number(cantidad),
       puntos_necesarios:Number(puntos_necesarios),
        imagen: ''
      };

      // await this._animalService.create(animal);
      await this._premioService.createPremio(premio, this.imagenFile!);
      Swal.fire({
        title: "Listo !",
        text: "Premio agregado correctamente",
        icon: "success",
        backdrop: 'rgba(0, 0, 0, 0.8)',
      });

      this._router.navigate(['/app/premios']);

    }
    catch (error) {
      this.errorMessage = 'Ha ocurrido un problema, revisa los datos ingresados';

    } finally {
      this.loading.set(false);

    }



  }


}
