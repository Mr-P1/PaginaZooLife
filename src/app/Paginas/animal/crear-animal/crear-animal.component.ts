import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearAnimal,AnimalesService} from '../../../data-acces/animales.service';
import { Router, RouterLink } from '@angular/router';

// Sweetalert2

import 'sweetalert2/src/sweetalert2.scss';

import Swal from 'sweetalert2';




@Component({
  selector: 'app-crear-animal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterLink],
  templateUrl: './crear-animal.component.html',
  styleUrl: './crear-animal.component.scss'
})
export class CrearAnimalComponent {
  private _formBuilder = inject(FormBuilder)
  private _animalService = inject(AnimalesService)
  private _router = inject(Router);



  loading = signal(false);

  form = this._formBuilder.group({
    nombre_comun: this._formBuilder.control("", [Validators.required]),
    nombre_cientifico: this._formBuilder.control("", [Validators.required]),
    especie: this._formBuilder.control("", [Validators.required]),
    estado: this._formBuilder.control("", [Validators.required]),
    numero_mapa: this._formBuilder.control("", [Validators.required]),
    descripcion: this._formBuilder.control("", [Validators.required]),
    curiosidad: this._formBuilder.control("", [Validators.required]),
    precaucion: this._formBuilder.control("", [Validators.required]),
    imagen: this._formBuilder.control("", [Validators.required]),


  })

  errorMessage: string | null = null;





  public imagenCargando = false;
  public imagenBase64 ='';


  public cargarFoto(e:Event){
    this.imagenCargando = true;
    const elemento = e.target as HTMLInputElement;
    const archivo = elemento.files ? elemento.files[0]:null;
    console.log(archivo)

    if(archivo)
    {
      const reader = new FileReader();
      reader.readAsDataURL(archivo);
      reader.onload = () =>{
        this.imagenCargando= false;
        this.imagenBase64 = reader.result as string
      }
    }

  }

  async submit() {
    console.log(this.form.getRawValue());

    if (this.form.invalid) return;
    try {
      this.loading.set(true);



      const { nombre_comun, nombre_cientifico, especie, estado, numero_mapa, descripcion, curiosidad, precaucion } = this.form.value;


      const animal: CrearAnimal = {
        nombre_comun : nombre_comun !,
        nombre_cientifico: nombre_cientifico !,
        especie: especie!,
        estado: estado!,
        posicion_mapa: Number(numero_mapa) !,
        descripcion: descripcion!,
        curiosidad: curiosidad!,
        precaucion: precaucion !,
        imagen: this.imagenBase64,



      };


      await this._animalService.create(animal);
      this._router.navigate(['/app/animales']);

    }
    catch (error) {
      this.errorMessage = 'Ha ocurrido un problema, revisa los datos ingresados';

    }finally{
      this.loading.set(false);

      Swal.fire({
        icon: "success",
        title: "Animal agregado correctamente",
        showConfirmButton: false,
        timer: 3000, // Cambiar el tiempo
        position: "center", // Centra la alerta
        backdrop: 'rgba(0,0,0,0.5)', // Fondo oscuro semi-transparente
      });
    }


  }

}
