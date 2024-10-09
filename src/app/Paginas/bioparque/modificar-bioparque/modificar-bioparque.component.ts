import { Component, inject, OnInit, signal } from '@angular/core';
import {Router, RouterLink, ActivatedRoute} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearPlanta, PlantaService } from '../../../data-acces/bioparque.service';


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
  private _bioparqueService = inject(PlantaService);
  private _router = inject(Router)

  loading = signal(false);
  loading2 = signal(false);
  imagenFile: File | null = null; // Almacenar el archivo de imagen seleccionado
  videoFile: File | null = null; // Almacenar el archivo de imagen seleccionado
  audioFile: File | null = null; // Almacenar el archivo de imagen seleccionado

  form = this._formBuilder.group({
    nombre_comun: this._formBuilder.control("", [Validators.required]),
    nombre_cientifico: this._formBuilder.control("", [Validators.required]),
    familia: this._formBuilder.control("", [Validators.required]),
    altura: this._formBuilder.control("", [Validators.required]),
    altura_formato: this._formBuilder.control("", [Validators.required]),
    descripcion_1: this._formBuilder.control("", [Validators.required]),
    descripcion_2: this._formBuilder.control("", [Validators.required]),
    descripcion_3: this._formBuilder.control("", [Validators.required]),
    zonas: this._formBuilder.control("", [Validators.required]),
    cuidados: this._formBuilder.control("", [Validators.required]),
    floracion: this._formBuilder.control("", [Validators.required]),
    importancia: this._formBuilder.control("", [Validators.required]),
    estado: this._formBuilder.control("", [Validators.required]),
    curiosidad: this._formBuilder.control("", [Validators.required]),
    precaucion: this._formBuilder.control("", [Validators.required]),
    usos: this._formBuilder.control("", [Validators.required]),
    posicion_mapa: this._formBuilder.control(0, [Validators.required]),
    imagen: this._formBuilder.control("", [Validators.required]),
    video: this._formBuilder.control("", [Validators.required]),
    audio: this._formBuilder.control("", [Validators.required])
  });


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

      this._bioparqueService.getPlanta(this.idActiva).subscribe(planta => {
        if (planta) {
          // Extraer la altura y el formato (asumiendo que la altura viene en formato "valor unidad")
          const [altura, altura_formato] = planta.altura.split(" ");

          this.form.patchValue({
            nombre_comun: planta.nombre_comun,
            nombre_cientifico: planta.nombre_cientifico,
            familia: planta.familia,
            altura: altura || "", // Si no hay valor de altura, asigna vacío
            altura_formato: altura_formato || "", // Si no hay formato, asigna vacío
            descripcion_1: planta.descripcion_1,
            descripcion_2: planta.descripcion_2,
            descripcion_3: planta.descripcion_3,
            zonas: planta.zonas,
            cuidados: planta.cuidados,
            floracion: planta.floracion,
            importancia: planta.importancia,
            estado: planta.estado,
            curiosidad: planta.curiosidad,
            precaucion: planta.precaucion,
            usos: planta.usos,
            posicion_mapa: planta.posicion_mapa,
            // Las siguientes propiedades las manejaremos por separado con los archivos subidos
            imagen: "", // Aquí manejamos la imagen como un archivo separado
          });
        } else {
          this.errorMessage = "Planta no encontrada.";
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
          nombre_comun,
          nombre_cientifico,
          familia,
          altura,
          altura_formato,
          descripcion_1,
          descripcion_2,
          descripcion_3,
          zonas,
          cuidados,
          floracion,
          importancia,
          estado,
          curiosidad,
          precaucion,
          usos,
          posicion_mapa
        } = this.form.value;

        const planta: CrearPlanta = {
          nombre_comun: nombre_comun!,
          nombre_cientifico: nombre_cientifico!,
          familia: familia!,
          altura:  `${altura} ${altura_formato}`,
          usos:usos!,
          posicion_mapa:posicion_mapa!,
          descripcion_1: descripcion_1!,
          descripcion_2: descripcion_2 || '',
          descripcion_3: descripcion_3 || '',
          zonas: zonas!,
          imagen: '',  // Se asigna más adelante tras la subida
          video: '',   // Se asigna más adelante tras la subida
          audio: '',   // Se asigna más adelante tras la subida
          cuidados: cuidados!,
          floracion: floracion!,
          importancia: importancia!,
          estado: estado!,
          curiosidad: curiosidad || '',
          precaucion: precaucion || ''
        };

        // Llamada al servicio pasando los archivos de imagen, video y audio, si fueron seleccionados
        await this._bioparqueService.editarPlanta(this.idActiva, planta, this.imagenFile!, this.videoFile! , this.audioFile!);

        Swal.fire({
          title: "Listo!",
          text: "La planta ha sido modificado correctamente",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });

        this._router.navigate(['/app/plantas']);
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
      text: 'Esta acción eliminará la planta de forma permanente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    });

    if (result.isConfirmed) {
      try {
        this.loading2.set(true);
        await this._bioparqueService.eliminarPlanta(this.idActiva);

        Swal.fire({
          title: "Listo!",
          text: "Planta eliminada correctamente, junto con sus archivos asociados.",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });

        this._router.navigate(['/app/plantas']);
      } catch (error) {
        this.errorMessage = 'Ha ocurrido un problema inesperado, vuelva a intentarlo';
      } finally {
        this.loading2.set(false);
      }
    }
  }



}
