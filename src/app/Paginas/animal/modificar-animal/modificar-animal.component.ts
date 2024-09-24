import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearAnimal, AnimalesService, Animal } from '../../../data-acces/animales.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';


// Sweetalert2

import 'sweetalert2/src/sweetalert2.scss';

import Swal from 'sweetalert2';



@Component({
  selector: 'app-modificar-animal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './modificar-animal.component.html',
  styleUrl: './modificar-animal.component.scss'
})
export class ModificarAnimalComponent implements OnInit {


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
    especie: this._formBuilder.control("", [Validators.required]),
    estado: this._formBuilder.control("", [Validators.required]),
    numero_mapa: this._formBuilder.control<number | null>(null, [Validators.required]),
    descripcion: this._formBuilder.control("", [Validators.required]),
    curiosidad: this._formBuilder.control("", [Validators.required]),
    precaucion: this._formBuilder.control("", [Validators.required]),
    imagen: this._formBuilder.control("", [Validators.required]),
  })





  ngOnInit() {
    this._rutaActiva.paramMap.subscribe(parametros => {
      this.idActiva = parametros.get("idAnimal")!;

      const animal = this._animalService.getAnimal(this.idActiva)

      if (!animal) return;
      this._animalService.getAnimal(this.idActiva).subscribe(animal => {
        if (animal) {

          this.form.patchValue({
            nombre_comun: animal.nombre_comun,
            nombre_cientifico: animal.nombre_cientifico,
            especie: animal.especie,
            estado: animal.estado,
            numero_mapa: animal.posicion_mapa,
            descripcion: animal.descripcion,
            curiosidad: animal.curiosidad,
            precaucion: animal.precaucion,

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


    console.log(this.form)
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    try {
      this.loading.set(true);
      const { nombre_comun, nombre_cientifico, especie, estado, numero_mapa, descripcion, curiosidad, precaucion } = this.form.value;


      const animal: CrearAnimal = {
        nombre_comun: nombre_comun!,
        nombre_cientifico: nombre_cientifico!,
        especie: especie!,
        estado: estado!,
        posicion_mapa: Number(numero_mapa)!,
        descripcion: descripcion!,
        curiosidad: curiosidad!,
        precaucion: precaucion!,
        imagen: this.imagenBase64,
      };

      await this._animalService.editarAnimal(this.idActiva, animal);

      Swal.fire({
        title: "Éxito",
        text: "El animal ha sido modificado correctamente",
        icon: "success",
        backdrop: 'rgba(0, 0, 0, 0.8)',
      });
      this._router.navigate(['/app/animales']);
    }

    catch {
      this.errorMessage = 'Ha ocurrido un problema, revisa los datos ingresados';

    }
    finally {
      this.loading.set(false);
    }



  }

  async borrarAnimal() {
    this.loading2.set(true);
    try {
      await this._animalService.eliminarAnimal(this.idActiva);
      Swal.fire({
        title: "Error",
        text: "Animal eliminado correctamente",
        icon: "error",
        backdrop: 'rgba(0, 0, 0, 0.8)', // Aumenta la opacidad
      });
      this._router.navigate(['/app/animales']);
    }
    catch{
      this.errorMessage = 'Ha ocurrido un problema inesperado, vuelva a intentarlo';
    }
    finally{
      this.loading2.set(false);
    }

  }



}
