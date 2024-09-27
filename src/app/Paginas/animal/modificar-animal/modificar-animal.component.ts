import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearAnimal, AnimalesService, Animal } from '../../../data-acces/animales.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';


// Sweetalert2
import Swal from 'sweetalert2';



@Component({
  selector: 'app-modificar-animal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './modificar-animal.component.html',
  styleUrl: './modificar-animal.component.scss'
})
export class ModificarAnimalComponent  {


  errorMessage: string | null = null;
  public idActiva = "";



  private _formBuilder = inject(FormBuilder);
  private _rutaActiva = inject(ActivatedRoute);
  private _animalService = inject(AnimalesService);
  private _router = inject(Router)




  loading = signal(false);
  loading2 = signal(false);


  form = this._formBuilder.group({
    nombre_comun: this._formBuilder.control("", [Validators.required]),
    nombre_cientifico: this._formBuilder.control("", [Validators.required]),
    descripcion_1: this._formBuilder.control("", [Validators.required]),
    descripcion_2: this._formBuilder.control("", [Validators.required]),
    descripcion_3: this._formBuilder.control("", [Validators.required]),
    dato_curioso: this._formBuilder.control("", [Validators.required]),
    precaucion_1: this._formBuilder.control("", [Validators.required]),
    precaucion_2: this._formBuilder.control("", [Validators.required]),
    precaucion_3: this._formBuilder.control("", [Validators.required]),
    peso: this._formBuilder.control("", [Validators.required]),
    unidad_peso: this._formBuilder.control("", [Validators.required]),
    altura: this._formBuilder.control("", [Validators.required]),
    unidad_altura: this._formBuilder.control("", [Validators.required]),
    habitad: this._formBuilder.control("", [Validators.required]),
    zona: this._formBuilder.control("", [Validators.required]),
    dieta: this._formBuilder.control("", [Validators.required]),
    dieta_descripcion: this._formBuilder.control("", [Validators.required]),
    comportamiento: this._formBuilder.control("", [Validators.required]),
    clase: this._formBuilder.control("", [Validators.required]), //Especie
    posicion_mapa: this._formBuilder.control("", [Validators.required]),
    cuidados: this._formBuilder.control("", [Validators.required]),
    estado_conservacion: this._formBuilder.control("", [Validators.required]),
    disponibilidad: this._formBuilder.control("", [Validators.required]),
    imagen: this._formBuilder.control("", [Validators.required]),

  })




  ngOnInit() {
    this._rutaActiva.paramMap.subscribe(parametros => {
      this.idActiva = parametros.get("idAnimal")!;

      this._animalService.getAnimal(this.idActiva).subscribe(animal => {
        if (animal) {
          this.form.patchValue({
            nombre_comun: animal.nombre_comun,
            nombre_cientifico: animal.nombre_cientifico,
            descripcion_1: animal.descripcion_1,
            descripcion_2: animal.descripcion_2,
            descripcion_3: animal.descripcion_3,
            dato_curioso: animal.dato_curioso,
            precaucion_1: animal.precaucion_1,
            precaucion_2: animal.precaucion_2,
            precaucion_3: animal.precaucion_3,
            peso: "",
            unidad_peso: "",
            altura: "",
            unidad_altura:"",
            habitad: animal.habitat,
            zona: animal.zona,
            dieta: animal.dieta,
            dieta_descripcion: "",
            comportamiento: animal.comportamiento,
            clase: animal.clase,
            posicion_mapa: String(animal.posicion_mapa),
            cuidados: animal.cuidados,
            estado_conservacion: animal.estado_conservacion,
            disponibilidad: animal.disponibilidad,
            imagen: "",
          });
        } else {
          this.errorMessage = "Animal no encontrado.";
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


  async actualizar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas actualizar la información del animal?',
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
          descripcion_1,
          descripcion_2,
          descripcion_3,
          dato_curioso,
          precaucion_1,
          precaucion_2,
          precaucion_3,
          peso,
          unidad_peso,
          altura,
          unidad_altura,
          habitad,
          zona,
          dieta,
          dieta_descripcion,
          comportamiento,
          clase,
          posicion_mapa,
          cuidados,
          estado_conservacion,
          disponibilidad,
          imagen
        } = this.form.value;

        const animal: CrearAnimal = {
          nombre_comun: nombre_comun!,
          nombre_cientifico: nombre_cientifico!,
          descripcion_1: descripcion_1!,
          descripcion_2: descripcion_2!,
          descripcion_3: descripcion_3!,
          dato_curioso: dato_curioso!,
          precaucion_1: precaucion_1!,
          precaucion_2: precaucion_2!,
          precaucion_3: precaucion_3!,
          peso: `${peso} ${unidad_peso}`,
          altura: `${altura} ${unidad_altura}`,
          dieta: `${dieta}: ${dieta_descripcion}`,  // Altura combinada con la unidad
          habitat: habitad!,
          zona: zona!,
          comportamiento: comportamiento!,
          estado_conservacion: estado_conservacion!,
          clase: clase!,  // Clase se refiere a la especie
          posicion_mapa: Number(posicion_mapa),
          cuidados: cuidados!,
          disponibilidad: disponibilidad!,
          imagen: this.imagenBase64 || imagen!,  // Si tienes una imagen en base64
        };

        await this._animalService.editarAnimal(this.idActiva, animal);

        Swal.fire({
          title: "Listo !",
          text: "El animal ha sido modificado correctamente",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });
        this._router.navigate(['/app/animales']);
      } catch {
        this.errorMessage = 'Ha ocurrido un problema, revisa los datos ingresados';
      } finally {
        this.loading.set(false);
      }
    }
  }

  async borrarAnimal() {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el animal de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    });

    if (result.isConfirmed) {
      try {
        this.loading2.set(true);
        await this._animalService.eliminarAnimal(this.idActiva);

        Swal.fire({
          title: "Listo !",
          text: "Animal eliminado correctamente",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });
        this._router.navigate(['/app/animales']);
      } catch {
        this.errorMessage = 'Ha ocurrido un problema inesperado, vuelva a intentarlo';
      } finally {
        this.loading2.set(false);
      }
    }
  }




}
