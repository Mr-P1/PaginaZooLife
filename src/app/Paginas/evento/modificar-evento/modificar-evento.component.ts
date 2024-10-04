import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearEvento, AnimalesService, evento} from '../../../data-acces/animales.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modificar-evento',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './modificar-evento.component.html',
  styleUrls: ['./modificar-evento.component.scss']
})
export class ModificarEventoComponent implements OnInit {

  public idActivo = "";
  public imagenCargando = false;
  public imagenBase64 = '';
  errorMessage: string | null = null;

  private _formBuilder = inject(FormBuilder);
  private _rutaActiva = inject(ActivatedRoute);
  private _eventoService = inject(AnimalesService);
  private _router = inject(Router);

  // Confirmacion
  loading = signal(false);
  loading2 = signal(false);

  // Form definition
  form = this._formBuilder.group({
    nombre_evento: ['', Validators.required],
    imagen: ['', Validators.required],
    descripcion: ['', Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_termino: ['', Validators.required]
  });

  ngOnInit() {
    // Capturing the active event ID from the route
    this._rutaActiva.paramMap.subscribe(parametros => {
      this.idActivo = parametros.get("idEvento")!;

      // Fetching event data and patching the form with values
      this._eventoService.getEvento(this.idActivo).subscribe(evento => {
        if (evento) {
          this.form.patchValue({
            nombre_evento: evento.nombre_evento,
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

  // Method for handling file input
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

  // Method to update the event
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

        const eventoActualizado: CrearEvento = {
          nombre_evento: this.form.value.nombre_evento!,
          fecha_inicio: this.form.value.fecha_inicio!,
          fecha_termino: this.form.value.fecha_termino!,
          descripcion: this.form.value.descripcion!,
          imagen: this.imagenBase64 || this.form.value.imagen!
        };

        // Updating event data in the service
        await this._eventoService.editarEvento(this.idActivo, eventoActualizado);

        // Success message and navigation
        Swal.fire({
          title: "¡Listo!",
          text: "El evento ha sido modificado correctamente",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });
        this._router.navigate(['/app/eventos']);  // Navigate to event list after successful update

      } catch {
        this.errorMessage = 'Ha ocurrido un problema, revisa los datos ingresados';
      } finally {
        this.loading.set(false);
      }
    }
  }

  // Borrar evento
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

        // Borrar la data
        await this._eventoService.eliminarEvento(this.idActivo);

        // Confirmacion
        Swal.fire({
          title: "¡Listo!",
          text: "Evento eliminado correctamente",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });
        this._router.navigate(['/app/eventos']);  // Vuelta a la pagina

      } catch {
        this.errorMessage = 'Ha ocurrido un problema inesperado, vuelva a intentarlo';
      } finally {
        this.loading2.set(false);
      }
    }
  }
}
