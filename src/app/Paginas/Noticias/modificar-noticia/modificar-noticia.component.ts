import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearNoticia, Noticiaservice } from '../../../data-acces/noticias.service';
import { Timestamp } from 'firebase/firestore';  // Asegúrate de que esta importación esté presente

// Sweetalert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modificar-noticia',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,],
  templateUrl: './modificar-noticia.component.html',
  styleUrl: './modificar-noticia.component.scss'
})
export class ModificarNoticiaComponent {

  errorMessage: string | null = null;
  public idActiva = "";

  private _formBuilder = inject(FormBuilder);
  private _rutaActiva = inject(ActivatedRoute);
  private _noticiaService = inject(Noticiaservice);
  private _router = inject(Router);

  loading = signal(false);
  loading2 = signal(false);
  imagenFile: File | null = null; // Almacenar el archivo de imagen seleccionado

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

  ngOnInit() {
    this._rutaActiva.paramMap.subscribe(parametros => {
      this.idActiva = parametros.get("idNoticia")!;

      this._noticiaService.getNoticia(this.idActiva).subscribe(noticia => {
        if (noticia) {
          this.form.patchValue({
            nombre: noticia.nombre,
            descripcion: noticia.descripcion,
            imagen: "", // La imagen se gestiona por separado
          });
        } else {
          this.errorMessage = "Noticia no encontrada.";
        }
      });
    });
  }

  async actualizar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas actualizar la información de la noticia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    });

    if (result.isConfirmed) {
      try {
        this.loading.set(true);

        const { nombre, descripcion } = this.form.value;

        const noticia: CrearNoticia = {
          nombre: nombre!,
          descripcion: descripcion!,
          imagen: '', // Se actualiza al subir el archivo
          fecha:Timestamp.now()
        };

        await this._noticiaService.editarNoticia(this.idActiva, noticia, this.imagenFile!);

        Swal.fire({
          title: "Listo!",
          text: "La noticia ha sido modificada correctamente",
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

  async borrarNoticia() {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la noticia de forma permanente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    });

    if (result.isConfirmed) {
      try {
        this.loading2.set(true);
        await this._noticiaService.eliminarNoticia(this.idActiva);

        Swal.fire({
          title: "Listo!",
          text: "Noticia eliminada correctamente, junto con su imagen asociada.",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });

        this._router.navigate(['/app/noticias']);
      } catch (error) {
        this.errorMessage = 'Ha ocurrido un problema inesperado, vuelva a intentarlo';
      } finally {
        this.loading2.set(false);
      }
    }
  }

}
