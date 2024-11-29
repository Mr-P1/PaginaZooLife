import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearNoticia, Noticiaservice } from '../../../data-acces/noticias.service';
import { Router, RouterLink } from '@angular/router';
import { Timestamp } from 'firebase/firestore';  // Asegúrate de que esta importación esté presente

// Sweetalert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-noticia',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-noticia.component.html',
  styleUrl: './crear-noticia.component.scss'
})
export class CrearNoticiaComponent {
  private _formBuilder = inject(FormBuilder);
  private _noticiasService = inject(Noticiaservice);
  private _router = inject(Router);

  loading = signal(false);
  imagenFile: File | null = null; // Almacenar el archivo de imagen seleccionado
  errorMessage: string | null = null;

  form = this._formBuilder.group({
    nombre: this._formBuilder.control("", [Validators.required]),
    descripcion: this._formBuilder.control("", [Validators.required]),
    imagen: this._formBuilder.control("", [Validators.required]),
  });

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
      const { nombre, descripcion } = this.form.value;

      const noticia: CrearNoticia = {
        nombre: nombre!,
        descripcion: descripcion!,
        imagen: '',
        fecha:Timestamp.now()
      };

      // Crear la noticia con la imagen cargada
      await this._noticiasService.createNoticia(noticia, this.imagenFile!);
      Swal.fire({
        title: "¡Listo!",
        text: "Noticia agregada correctamente",
        icon: "success",
        backdrop: 'rgba(0, 0, 0, 0.8)',
      });

      this._router.navigate(['/app/noticias']);

    } catch (error) {
      this.errorMessage = 'Ha ocurrido un problema, revisa los datos ingresados';
    } finally {
      this.loading.set(false);
    }
  }
}
