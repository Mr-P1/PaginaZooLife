import { Component, inject, OnInit, signal } from '@angular/core';
import {Router, RouterLink, ActivatedRoute} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearBioparque, BioparqueService } from '../../../data-acces/bioparque.service';


// Sweetalert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modificar-bioparque',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './modificar-bioparque.component.html',
  styleUrl: './modificar-bioparque.component.scss'
})
export class ModificarBioparqueComponent {

  errorMessage: string | null = null;
  public idActiva = "";

  private _formBuilder = inject(FormBuilder);
  private _rutaActiva = inject(ActivatedRoute);
  private _bioparqueService = inject(BioparqueService);
  private _router = inject(Router)

  loading = signal(false);
  loading2 = signal(false);
  imagenFile: File | null = null; // Almacenar el archivo de imagen seleccionado
  videoFile: File | null = null; // Almacenar el archivo de imagen seleccionado
  audioFile: File | null = null; // Almacenar el archivo de imagen seleccionado

  form = this._formBuilder.group({
    nombre: this._formBuilder.control("", [Validators.required]),
    familia: this._formBuilder.control("", [Validators.required]),
    altura: this._formBuilder.control(0, [Validators.required]),
    altura_formato: this._formBuilder.control("", [Validators.required]),
    distribucion: this._formBuilder.control("", [Validators.required]),
    zonas: this._formBuilder.control("", [Validators.required]),
    relacion_entorno: this._formBuilder.control("", [Validators.required]),
    imagen: this._formBuilder.control("", [Validators.required]),
    video: this._formBuilder.control("", [Validators.required]),
    audio: this._formBuilder.control("", [Validators.required]),
  })


   // Método para cargar la imagen seleccionada
   public cargarFoto(event: Event) {
    const elemento = event.target as HTMLInputElement;
    const archivo = elemento.files ? elemento.files[0] : null;
    if (archivo) {
      this.imagenFile = archivo; // Almacena el archivo de imagen seleccionado
    }
  }
  public cargarVideo(e: Event) {
    const elemento = e.target as HTMLInputElement;
    const archivo = elemento.files ? elemento.files[0] : null;
    if (archivo) {
      this.videoFile = archivo;  // Almacena el archivo de video seleccionado
    }
  }

  public cargarAudio(e: Event) {
    const elemento = e.target as HTMLInputElement;
    const archivo = elemento.files ? elemento.files[0] : null;
    if (archivo) {
      this.audioFile = archivo;  // Almacena el archivo de audio seleccionado
    }
  }


  ngOnInit() {
    this._rutaActiva.paramMap.subscribe(parametros => {
      this.idActiva = parametros.get("idBioparque")!;

      this._bioparqueService.getBioparque(this.idActiva).subscribe(bioparque => {
        if (bioparque) {
          this.form.patchValue({
            nombre : bioparque.nombre,
            familia:bioparque.familia,
            altura : 0,
            altura_formato:"",
            distribucion:bioparque.distribucion,
            zonas:bioparque.zonas,
            relacion_entorno:bioparque.relacion_entorno,
            imagen: "",
            video:"",
            audio:""
          });
        } else {
          this.errorMessage = "bioparque no encontrado.";
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
      text: '¿Deseas actualizar la información de la planta?',
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
          imagen: '',
          video:"",
          audio:""
        };
        // Llamada al servicio pasando los archivos de imagen, video y audio, si fueron seleccionados
        await this._bioparqueService.editarBioparque(this.idActiva, bioparque, this.imagenFile!, this.videoFile! , this.audioFile!);

        Swal.fire({
          title: "Listo!",
          text: "El bioparque ha sido modificado correctamente",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });

        this._router.navigate(['/app/bioparque']);
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
      text: 'Esta acción eliminará el bioparque de forma permanente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    });

    if (result.isConfirmed) {
      try {
        this.loading2.set(true);
        await this._bioparqueService.eliminarBioparque(this.idActiva);

        Swal.fire({
          title: "Listo!",
          text: "Bioparque eliminado correctamente, junto con sus archivos asociados.",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });

        this._router.navigate(['/app/bioparque']);
      } catch (error) {
        this.errorMessage = 'Ha ocurrido un problema inesperado, vuelva a intentarlo';
      } finally {
        this.loading2.set(false);
      }
    }
  }



}
