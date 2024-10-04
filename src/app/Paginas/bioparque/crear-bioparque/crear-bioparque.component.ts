import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearBioparque, BioparqueService } from '../../../data-acces/bioparque.service';
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
  private _formBuilder = inject(FormBuilder)
  private _bioparqueService = inject(BioparqueService)
  private _router = inject(Router);

  loading = signal(false);
  imagenFile: File | null = null; // Almacenar el archivo de imagen seleccionado
  errorMessage: string | null = null;

  form = this._formBuilder.group({
    nombre: this._formBuilder.control("", [Validators.required]),
    familia: this._formBuilder.control("", [Validators.required]),
    altura: this._formBuilder.control(0, [Validators.required]),
    altura_formato: this._formBuilder.control("", [Validators.required]),
    distribucion: this._formBuilder.control("", [Validators.required]),
    zonas: this._formBuilder.control("", [Validators.required]),
    relacion_entorno: this._formBuilder.control("", [Validators.required]),
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
        familia,
        altura,
        altura_formato,
        distribucion,
        zonas,
        relacion_entorno,


      } = this.form.value;


      const bioparque: CrearBioparque = {
        nombre: nombre!,
        familia:familia!,
        altura: `${altura} ${altura_formato}`,
        distribucion:distribucion !,
        zonas:zonas!,
        relacion_entorno:relacion_entorno!,
        imagen: ''
      };

      // await this._animalService.create(animal);
      await this._bioparqueService.createBioparque(bioparque, this.imagenFile!);
      Swal.fire({
        title: "Listo !",
        text: "Bioparque agregado correctamente",
        icon: "success",
        backdrop: 'rgba(0, 0, 0, 0.8)',
      });

      this._router.navigate(['/app/bioparque']);

    }
    catch (error) {
      this.errorMessage = 'Ha ocurrido un problema, revisa los datos ingresados';

    } finally {
      this.loading.set(false);

    }
  }


}
