import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {AnimalesService, CambiarMapa, Mapa} from '../../data-acces/animales.service';

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


  async submit(){
    if (this.form.invalid) return;

    try{
      this.loading.set(true);


      const cambioMapa:CambiarMapa={
        imagen: this.imagenBase64
      }

      await this._animalService.editarMapa(this.mapa[0].id, cambioMapa);

      this._router.navigate(['/app/animales']);


    }
    catch{

    }
    finally{

    }

  }


}
