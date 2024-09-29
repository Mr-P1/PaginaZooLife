import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, addDoc, collectionData, doc, getDoc, updateDoc, query, where, deleteDoc, getDocs } from '@angular/fire/firestore';
import {  Storage, ref, uploadBytes, getDownloadURL, deleteObject} from '@angular/fire/storage';
import { catchError, Observable, tap, throwError, from } from 'rxjs';
import { AuthStateService } from './auth-state.service';
import { map } from 'rxjs/operators';


export interface Animal {
  id: string;
  nombre_comun: string,
  nombre_cientifico: string,
  descripcion_1: string,
  descripcion_2: string,
  descripcion_3: string,
  dato_curioso: string,
  precaucion_1: string,
  precaucion_2: string,
  precaucion_3: string,
  peso: string,
  altura: string,
  habitat: string,
  zona: string,
  dieta: string,
  comportamiento: string,
  estado_conservacion: string,
  clase: string,
  posicion_mapa: number,
  cuidados: string,
  disponibilidad: string,
  imagen: string,
  video?: string;
  audio?: string;
}
export interface evento{

  id:string,
  nombre_evento: string,
  imagen: string,
  descripcion:string,
  fecha_inicio:string,
  fecha_termino:string
}

export interface AnimalConValoraciones extends Animal {
  likes: number;
  dislikes: number;
}



export interface Mapa {
  id: string,
  imagen: string
}

export interface Reaccion {
  id: string;
  ID_animal: string;  // ID del animal al que le dieron like/dislike
  ID_usuario: string;  // ID del usuario que reaccionó
  reaccion: boolean;   // true para like, false para dislike
}



//Lo siguiente tiene para omitir el id porque recien lo vamos a crear
export type CrearAnimal = Omit<Animal, 'id'>
export type CambiarMapa = Omit<Mapa, 'id'>
export type CrearEvento = Omit<evento, 'id'>

const PATH_Animal = 'Animales';
const PATH_Mapa = 'Mapa';
const PATH_Reacciones = 'Reacciones';
const PATH_Eventos = 'Eventos';

@Injectable({
  providedIn: 'root'
})
export class AnimalesService {

  constructor() { }

  private _firestore = inject(Firestore);
  private _rutaAnimal = collection(this._firestore, PATH_Animal);
  private _rutaEventos = collection(this._firestore, PATH_Eventos);
  private _rutaMapa = collection(this._firestore, PATH_Mapa);
  private _rutaReacciones = collection(this._firestore, PATH_Reacciones);
  private _authState = inject(AuthStateService);
  private _storage = inject(Storage); // Agrega Storage



  create(animal: CrearAnimal) {
    return addDoc(this._rutaAnimal, animal);
  }

  createEvento(Evento: CrearEvento) {
    return addDoc(this._rutaEventos, Evento);
  }

  getAnimales(): Observable<Animal[]> {
    return collectionData(this._rutaAnimal, { idField: 'id' }) as Observable<Animal[]>;
  }

  getEventos(): Observable<evento[]> {
    return collectionData(this._rutaEventos, { idField: 'id' }) as Observable<evento[]>;
  }



  getAnimal(id: string): Observable<Animal | null> {
    const docRef = doc(this._rutaAnimal, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as Animal : null)
    );
  }

  getEvento(id: string): Observable<evento| null> {
    const docRef = doc(this._rutaEventos, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as evento : null)
    );
  }



  editarEvento(id: string, evento: CrearEvento) {
    const document = doc(this._rutaEventos, id)
    return updateDoc(document, { ...evento })
  }

  getMapa(): Observable<Mapa[]> {
    return collectionData(this._rutaMapa, { idField: 'id' }) as Observable<Mapa[]>;
  }

  async editarMapa(id: string, imagenFile: File): Promise<void> {
    const docRef = doc(this._rutaMapa, id);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const mapaData = docSnapshot.data() as Mapa;

      // Eliminar la imagen anterior de Firebase Storage si existe
      if (mapaData.imagen) {
        const oldImageRef = ref(this._storage, mapaData.imagen);
        await deleteObject(oldImageRef).catch(() => {
          console.warn('No se pudo eliminar la imagen anterior.');
        });
      }

      // Subir la nueva imagen a Firebase Storage
      const filePath = `mapas/${imagenFile.name}`;
      const storageRef = ref(this._storage, filePath);
      const snapshot = await uploadBytes(storageRef, imagenFile);

      // Obtener la URL de la nueva imagen
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Actualizar el documento en Firestore con la nueva URL
      await updateDoc(docRef, { imagen: downloadURL });
    } else {
      throw new Error('Mapa no encontrado');
    }
  }

  eliminarEvento(id: string) {
    const eventoDoc = doc(this._rutaEventos, id);
    return deleteDoc(eventoDoc);
  }


  async getAnimalesConValoraciones(): Promise<AnimalConValoraciones[]> {
    const animalesSnapshot = await getDocs(this._rutaAnimal);
    const reaccionesSnapshot = await getDocs(this._rutaReacciones);

    const animales = animalesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Animal[];

    const conteo: { [key: string]: { likes: number; dislikes: number } } = {};

    reaccionesSnapshot.docs.forEach(doc => {
      const reaccion = doc.data() as Reaccion;
      const id = reaccion.ID_animal;

      if (!conteo[id]) {
        conteo[id] = { likes: 0, dislikes: 0 };
      }
      if (reaccion.reaccion) {
        conteo[id].likes++;
      } else {
        conteo[id].dislikes++;
      }
    });

    const resultado = animales.map(animal => ({
      ...animal,
      likes: conteo[animal.id]?.likes || 0,
      dislikes: conteo[animal.id]?.dislikes || 0
    })) as AnimalConValoraciones[];

    return resultado;
  }


   // Subir imagen a Cloud Storage
   async uploadImage(file: File): Promise<string> {
    const filePath = `animales/${file.name}`; // Ruta donde se almacenará la imagen en Cloud Storage
    const storageRef = ref(this._storage, filePath);
    const snapshot = await uploadBytes(storageRef, file); // Sube el archivo
    return getDownloadURL(snapshot.ref); // Obtiene la URL pública de la imagen
  }


  async uploadVideo(file: File): Promise<string> {
    const filePath = `animales/videos/${file.name}`;
    const storageRef = ref(this._storage, filePath);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  }

  // Subir audio a Cloud Storage
  async uploadAudio(file: File): Promise<string> {
    const filePath = `animales/audios/${file.name}`;
    const storageRef = ref(this._storage, filePath);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  }


  async createAnimal(animal: CrearAnimal, imagenFile: File, videoFile?: File, audioFile?: File) {
    // Sube la imagen, video y audio
    const imageUrl = await this.uploadImage(imagenFile);
    const videoUrl = videoFile ? await this.uploadVideo(videoFile) : '';
    const audioUrl = audioFile ? await this.uploadAudio(audioFile) : '';

    const animalData = {
      ...animal,
      imagen: imageUrl,
      video: videoUrl,
      audio: audioUrl
    };
    return addDoc(this._rutaAnimal, animalData);
  }

  async editarAnimal(id: string, animal: CrearAnimal, imagenFile?: File, videoFile?: File, audioFile?: File) {
    // Subir los nuevos archivos solo si se proporcionan
    const imageUrl = imagenFile ? await this.uploadImage(imagenFile) : animal.imagen;
    const videoUrl = videoFile ? await this.uploadVideo(videoFile) : animal.video || '';
    const audioUrl = audioFile ? await this.uploadAudio(audioFile) : animal.audio || '';

    const animalData = {
      ...animal,
      imagen: imageUrl,
      video: videoUrl,
      audio: audioUrl
    };

    const document = doc(this._rutaAnimal, id);
    return updateDoc(document, animalData);
  }


  async eliminarAnimal(id: string): Promise<void> {
    // Obtener el documento del animal
    const animalDoc = doc(this._rutaAnimal, id);
    const animalSnapshot = await getDoc(animalDoc);

    if (animalSnapshot.exists()) {
      const animalData = animalSnapshot.data() as Animal;

      // Eliminar imagen de Firebase Storage si existe
      if (animalData.imagen) {
        const imageRef = ref(this._storage, animalData.imagen);
        await deleteObject(imageRef).catch(() => {
          console.warn(`No se pudo eliminar la imagen: ${animalData.imagen}`);
        });
      }

      // Eliminar video de Firebase Storage si existe
      if (animalData.video) {
        const videoRef = ref(this._storage, animalData.video);
        await deleteObject(videoRef).catch(() => {
          console.warn(`No se pudo eliminar el video: ${animalData.video}`);
        });
      }

      // Eliminar audio de Firebase Storage si existe
      if (animalData.audio) {
        const audioRef = ref(this._storage, animalData.audio);
        await deleteObject(audioRef).catch(() => {
          console.warn(`No se pudo eliminar el audio: ${animalData.audio}`);
        });
      }

      // Finalmente, eliminar el documento del animal en Firestore
      await deleteDoc(animalDoc);
    } else {
      throw new Error('Animal no encontrado');
    }
  }




}
