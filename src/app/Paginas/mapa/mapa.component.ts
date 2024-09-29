import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AnimalesService, Mapa } from '../../data-acces/animales.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss',
})
export class MapaComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private _animalService = inject(AnimalesService);
  private _router = inject(Router);

  loading = signal(false);
  form = this._formBuilder.group({
    imagen: this._formBuilder.control('', [Validators.required]),
  });

  errorMessage: string | null = null;
  public imagenCargando = false;
  public imagenFile: File | null = null;
  mapa: Mapa[] = [];

  ngOnInit() {
    this._animalService.getMapa().subscribe((data: Mapa[]) => {
      this.mapa = data;
    });
  }

  public cargarFoto(event: Event) {
    const elemento = event.target as HTMLInputElement;
    const archivo = elemento.files ? elemento.files[0] : null;
    if (archivo) {
      this.imagenFile = archivo;
    }
  }

  async submit() {
    if (this.form.invalid || !this.imagenFile) {
      this.form.markAllAsTouched();
      return;
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas confirmar el cambio de mapa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    });

    if (result.isConfirmed) {
      try {
        this.loading.set(true);

        await this._animalService.editarMapa(this.mapa[0].id, this.imagenFile);

        Swal.fire({
          title: 'Listo!',
          text: 'El mapa ha sido modificado correctamente',
          icon: 'success',
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });

        this._router.navigate(['/app/animales']);
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Ha ocurrido un problema inesperado',
          icon: 'error',
          backdrop: 'rgba(0, 0, 0, 0.8)',
        });
      } finally {
        this.loading.set(false);
      }
    }
  }
}
