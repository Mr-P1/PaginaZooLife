
import { Component, inject, signal } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  imagenFile: File | null = null; // Almacenar el archivo de imagen seleccionado
  videoFile: File | null = null; // Almacenar el archivo de imagen seleccionado
  audioFile: File | null = null; // Almacenar el archivo de imagen seleccionado
  audioAnimalFile: File | null = null; // Almacenar el archivo de imagen seleccionado


  loading = signal(false);
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

  public cargarAudioAnimal(e: Event) {
    const elemento = e.target as HTMLInputElement;
    const archivo = elemento.files ? elemento.files[0] : null;
    if (archivo) {
      this.audioAnimalFile = archivo;  // Almacena el archivo de audio seleccionado
    }
  }


}
