import { Component, inject, OnInit, signal } from '@angular/core';
import {Router, RouterLink, ActivatedRoute} from '@angular/router';
import { CrearPremioTrivia, PremioTrivia, PremiosService } from '../../../data-acces/premios.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

// Sweetalert2
import Swal from 'sweetalert2';


@Component({
  selector: 'app-modificar-premios-trivia',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './modificar-premios-trivia.component.html',
  styleUrl: './modificar-premios-trivia.component.scss'
})
export class ModificarPremiosTriviaComponent {

  errorMessage: string | null = null;
  public idActiva = "";

  private _formBuilder = inject(FormBuilder);
  private _rutaActiva = inject(ActivatedRoute);
  private _premioService = inject(PremiosService);
  private _router = inject(Router)


  loading = signal(false);
  loading2 = signal(false);
  imagenFile: File | null = null; // Almacenar el archivo de imagen seleccionado


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


  ngOnInit() {
    this._rutaActiva.paramMap.subscribe(parametros => {
      this.idActiva = parametros.get("idPremio")!;

      this._premioService.getPremio(this.idActiva).subscribe(premio => {
        if (premio) {
          this.form.patchValue({
            nombre : premio.nombre,
            descripcion:premio.descripcion,
            cantidad:premio.cantidad,
            puntos_necesarios: premio.puntos_necesarios,
            imagen: "",
          });
        } else {
          this.errorMessage = "Premio no encontrado.";
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
      text: '¿Deseas actualizar la información del premio?',
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
         nombre,
         descripcion,
         cantidad,
         puntos_necesarios
        } = this.form.value;

        const premio: CrearPremioTrivia = {
          nombre:nombre !,
          descripcion:descripcion !,
          cantidad:cantidad !,
          puntos_necesarios:puntos_necesarios !,
          imagen: '',  // Este campo se actualizará en el servicio
        };

        // Llamada al servicio pasando los archivos de imagen, video y audio, si fueron seleccionados
        await this._premioService.editarPremio(this.idActiva, premio, this.imagenFile!);

        Swal.fire({
          title: "Listo!",
          text: "El premio ha sido modificado correctamente",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });

        this._router.navigate(['/app/premios']);
      } catch (error) {
        this.errorMessage = 'Ha ocurrido un problema, revisa los datos ingresados';
      } finally {
        this.loading.set(false);
      }
    }
  }

  async borrarPremio() {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el Premio de forma permanente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    });

    if (result.isConfirmed) {
      try {
        this.loading2.set(true);
        await this._premioService.eliminarPremio(this.idActiva);

        Swal.fire({
          title: "Listo!",
          text: "Premio eliminado correctamente, junto con sus archivos asociados.",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });

        this._router.navigate(['/app/premios']);
      } catch (error) {
        this.errorMessage = 'Ha ocurrido un problema inesperado, vuelva a intentarlo';
      } finally {
        this.loading2.set(false);
      }
    }
  }





}
