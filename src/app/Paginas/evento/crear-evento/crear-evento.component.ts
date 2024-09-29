import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearEvento } from '../../../data-acces/animales.service';
import { Router, RouterLink } from '@angular/router';
import {  AnimalesService } from '../../../data-acces/animales.service';

// Sweetalert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-evento',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink,],
  templateUrl: './crear-evento.component.html',
  styleUrl: './crear-evento.component.scss'
})
export class CrearEventoComponent {
  private _formBuilder = inject(FormBuilder)
  private _router = inject(Router);
  private _animalService = inject(AnimalesService)

  loading = signal(false);

  form = this._formBuilder.group({
    nombre_evento: this._formBuilder.control("", [Validators.required]),
    fecha_inicio: this._formBuilder.control("", [Validators.required]),
    fecha_termino: this._formBuilder.control("", [Validators.required]),
    descripcion: this._formBuilder. control("", [Validators.required]),
    imagen: this._formBuilder.control("", [Validators.required]),
  })

  errorMessage: string | null = null;

  public imagenCargando = false;
  public imagenBase64 = '';

  public cargarFoto(e: Event) {
    this.imagenCargando = true;
    const elemento = e.target as HTMLInputElement;
    const archivo = elemento.files ? elemento.files[0] : null;
    console.log(archivo)

    if (archivo) {
      const reader = new FileReader();
      reader.readAsDataURL(archivo);
      reader.onload = () => {
        this.imagenCargando = false;
        this.imagenBase64 = reader.result as string
      }
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
        nombre_evento,
        fecha_inicio,
        fecha_termino,
        descripcion,
        imagen
      } = this.form.value;



      const evento: CrearEvento = {
        nombre_evento: nombre_evento!,
        fecha_inicio: fecha_inicio!,
        fecha_termino: fecha_termino!,
        descripcion: descripcion!,
        imagen: this.imagenBase64 || imagen!,
      };

      await this._animalService.createEvento(evento);
      console.log(evento)
      this._router.navigate(['/app/eventos']);
    }
    catch (error) {
      this.errorMessage = 'Ha ocurrido un problema, revisa los datos ingresados';
    } finally {
      this.loading.set(false);
      Swal.fire({
        title: "Listo !",
        text: "Evento agregado correctamente",
        icon: "success",
        backdrop: 'rgba(0, 0, 0, 0.8)',
      });
    }
  }
}
