import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {AnimalesService, CambiarMapa, Mapa} from '../../data-acces/animales.service';

// Sweetalert2
import Swal from 'sweetalert2';


@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterLink],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss'
})
export class MapaComponent implements OnInit{

  private _formBuilder = inject(FormBuilder);
  private _animalService = inject(AnimalesService);
  private _router = inject(Router);


  loading = signal(false);

  form = this._formBuilder.group({
    imagen: this._formBuilder.control("", [Validators.required]),
  })

  errorMessage: string | null = null;


  public imagenCargando = false;
  public imagenBase64: string = '';


  public cargarFoto(e: Event) {
    this.imagenCargando = true;
    const elemento = e.target as HTMLInputElement;
    const archivo = elemento.files ? elemento.files[0] : null;
    console.log(archivo);

    if (archivo) {
      const reader = new FileReader();
      reader.readAsDataURL(archivo);
      reader.onload = () => {
        this.imagenCargando = false;

        // Tipo string explícito
        this.imagenBase64 = reader.result as string;
      };
    }
  }
  mapa :Mapa[] = [] ;
  ngOnInit(){

    this._animalService.getMapa().subscribe((data: Mapa[]) => {
      this.mapa = data;

      console.log(this.mapa)
  })};


  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Mostrar alerta de confirmación antes de realizar la acción
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas confirmar el cambio de mapa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    });

    // Si el usuario confirma, se procede con el cambio de mapa
    if (result.isConfirmed) {
      try {
        this.loading.set(true);

        const cambioMapa: CambiarMapa = {
          imagen: this.imagenBase64,
        };


        await this._animalService.editarMapa(this.mapa[0].id, cambioMapa);

        Swal.fire({
          title: "Listo !",
          text: "El mapa ha sido modificado correctamente",
          icon: "success",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });

        this._router.navigate(['/app/animales']);

      } catch (error) {

        Swal.fire({
          title: "Error !",
          text: "Ha ocurrido un problema inesperado",
          icon: "error",
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });

      } finally {

        this.loading.set(false);
      }
    }
  }


}
