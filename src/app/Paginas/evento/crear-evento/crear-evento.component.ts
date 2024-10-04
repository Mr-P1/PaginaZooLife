import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearEvento, EventoService } from '../../../data-acces/eventos.service';
import { Router, RouterLink } from '@angular/router';

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
  private _animalService = inject(EventoService)

  loading = signal(false);

  form = this._formBuilder.group({
    nombre_evento: ['', Validators.required],
    imagen: ['', Validators.required],
    descripcion: ['', Validators.required],
    fecha_inicio: ['', Validators.required],
    hora_inicio: ['', Validators.required],
    fecha_termino: ['', Validators.required],
    hora_termino: ['', Validators.required],
  });

  errorMessage: string | null = null;

  imagenFile: File | null = null;

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
        nombre_evento,
        fecha_inicio,
        hora_inicio,
        fecha_termino,
        hora_termino,
        descripcion
      } = this.form.value;



      const evento: CrearEvento = {
        nombre_evento: nombre_evento!,
        fecha_inicio: fecha_inicio!,
        hora_inicio:hora_inicio!,
        fecha_termino: fecha_termino!,
        hora_termino:hora_termino!,
        descripcion: descripcion!,
        imagen: ""
      };


      await this._animalService.createEvento(evento,this.imagenFile!);
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
