import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearEvento, AnimalesService, evento } from '../../../data-acces/animales.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

// Sweetalert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modificar-evento',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './modificar-evento.component.html',
  styleUrl: './modificar-evento.component.scss'
})
export class ModificarEventoComponent {

  errorMessage: string | null = null;
  public idActivo = "";

  private _formBuilder = inject(FormBuilder);
  private _rutaActiva = inject(ActivatedRoute);
  private _eventoService = inject(AnimalesService);
  private _router = inject(Router);

  loading = signal(false);
  loading2 = signal(false);

  form = this._formBuilder.group({
    id: this._formBuilder.control("", [Validators.required]),
    nombre_evento: this._formBuilder.control("", [Validators.required]),
    imagen: this._formBuilder.control("", [Validators.required]),
    descripcion: this._formBuilder.control("", [Validators.required]),
    fecha_inicio: this._formBuilder.control("", [Validators.required]),
    fecha_termino: this._formBuilder.control("", [Validators.required]),

  });

  ngOnInit() {
    this._rutaActiva.paramMap.subscribe(parametros => {
      this.idActivo = parametros.get("idEvento")!;

      this._eventoService.getEvento(this.idActivo).subscribe(evento => {
        if (evento) {
          this.form.patchValue({
            id: evento.id,
            nombre_evento: evento.nombre_evento,
            imagen: "",
            fecha_inicio: evento.fecha_inicio,
            fecha_termino: evento.fecha_termino,
            descripcion: evento.descripcion

          });
        } else {
          this.errorMessage = "Evento no encontrado.";
        }
      });
    });
  }

  public imagenCargando = false;
  public imagenBase64 = '';

  public cargarFoto(e: Event) {
    this.imagenCargando = true;
    const elemento = e.target as HTMLInputElement;
    const archivo = elemento.files ? elemento.files[0] : null;

    if (archivo) {
      const reader = new FileReader();
      reader.readAsDataURL(archivo);
      reader.onload = () => {
        this.imagenCargando = false;
        this.imagenBase64 = reader.result as string;
      };
    }
  }

  async actualizar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas actualizar la información del evento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    });

    if (result.isConfirmed) {
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

        await this._eventoService.editarEvento(this.idActivo, evento);

        Swal.fire({
          title: "¡Listo!",
          text: "El evento ha sido modificado correctamente",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });
        this._router.navigate(['/app/eventos']);
      } catch {
        this.errorMessage = 'Ha ocurrido un problema, revisa los datos ingresados';
      } finally {
        this.loading.set(false);
      }
    }
  }

  async borrarEvento() {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el evento de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    });

    if (result.isConfirmed) {
      try {
        this.loading2.set(true);
        await this._eventoService.eliminarEvento(this.idActivo);

        Swal.fire({
          title: "¡Listo!",
          text: "Evento eliminado correctamente",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });
        this._router.navigate(['/app/eventos']);
      } catch {
        this.errorMessage = 'Ha ocurrido un problema inesperado, vuelva a intentarlo';
      } finally {
        this.loading2.set(false);
      }
    }
  }
}
