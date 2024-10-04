import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore, collection, addDoc, collectionData, doc, getDoc, updateDoc, query,
  where, deleteDoc, getDocs, orderBy, limit, startAfter, DocumentData,
  startAt, setDoc,
  onSnapshot
} from '@angular/fire/firestore';

import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { catchError, Observable, tap, throwError, from } from 'rxjs';
import { AuthStateService } from './auth-state.service';
import { map } from 'rxjs/operators';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';


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
export interface evento {

  id: string,
  nombre_evento: string,
  imagen: string,
  descripcion: string,
  fecha_inicio: string,
  fecha_termino: string
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
  animalId: string;  // ID del animal al que le dieron like/dislike
  userId: string;  // ID del usuario que reaccionó
  reaction: boolean;   // true para like, false para dislike
}

export interface PreguntaTrivia {
  id: string;              // ID único de la pregunta
  pregunta: string;        // Texto de la pregunta
  respuestas: Respuestas;  // Las 4 posibles respuestas
  respuesta_correcta:string;   // Clave de la respuesta correcta (a, b, c, d)
  tipo: string;  // Tipo de pregunta: para niño o adulto
  animal_id: string;  // ID del animal asociado
}

export interface Respuestas {
  [key: string]: string;
  a: string;  // Respuesta opción A
  b: string;  // Respuesta opción B
  c: string;  // Respuesta opción C
  d: string;  // Respuesta opción D
}



//Lo siguiente tiene para omitir el id porque recien lo vamos a crear
export type CrearAnimal = Omit<Animal, 'id'>
export type CambiarMapa = Omit<Mapa, 'id'>
export type CrearEvento = Omit<evento, 'id'>
export type CrearPregunta = Omit<PreguntaTrivia, 'id'>

const PATH_Animal = 'Animales';
const PATH_Mapa = 'Mapa';
const PATH_Reacciones = 'Reacciones';
const PATH_Eventos = 'Eventos';
const PATH_Pregunta = 'Preguntas'

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
  private _rutaPreguntas = collection(this._firestore, PATH_Pregunta);
  private boletasUsadasRef = collection(this._firestore, 'Boletas_usadas');


  private _authState = inject(AuthStateService);
  private _storage = inject(Storage); // Agrega Storage

  getAnimales(): Observable<Animal[]> {
    return collectionData(this._rutaAnimal, { idField: 'id' }) as Observable<Animal[]>;
  }

  getPreguntas(): Observable<PreguntaTrivia[]> {
    return collectionData(this._rutaPreguntas, { idField: 'id' }) as Observable<PreguntaTrivia[]>;
  }


  // Obtener la primera página o la página siguiente
  async getAnimalesPaginados(pageSize: number, lastVisibleDoc: any = null): Promise<{ animales: Animal[], lastVisible: any, firstVisible: any }> {
    let q;
    if (lastVisibleDoc) {
      q = query(this._rutaAnimal, orderBy('nombre_comun'), startAfter(lastVisibleDoc), limit(pageSize));
    } else {
      q = query(this._rutaAnimal, orderBy('nombre_comun'), limit(pageSize));
    }

    const snapshot = await getDocs(q);
    const animales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Animal[];
    const lastVisible = snapshot.docs[snapshot.docs.length - 1]; // Cambia el nombre aquí
    const firstVisible = snapshot.docs[0]; // Cambia el nombre aquí

    return { animales, lastVisible, firstVisible };
  }

  // Obtener la página anterior
  async getAnimalesPaginadosAnterior(pageSize: number, firstVisibleDoc: any): Promise<{ animales: Animal[], lastVisible: any, firstVisible: any }> {
    const q = query(this._rutaAnimal, orderBy('nombre_comun'), startAt(firstVisibleDoc), limit(pageSize));

    const snapshot = await getDocs(q);
    const animales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Animal[];
    const lastVisible = snapshot.docs[snapshot.docs.length - 1]; // Cambia el nombre aquí
    const firstVisible = snapshot.docs[0]; // Cambia el nombre aquí

    return { animales, lastVisible, firstVisible };
  }


  createEvento(Evento: CrearEvento) {
    return addDoc(this._rutaEventos, Evento);
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


  getPregunta(id: string): Observable<PreguntaTrivia | null> {
    const docRef = doc(this._rutaPreguntas, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as PreguntaTrivia : null)
    );
  }

  getEvento(id: string): Observable<evento | null> {
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
      const id = reaccion.animalId;

      if (!conteo[id]) {
        conteo[id] = { likes: 0, dislikes: 0 };
      }
      if (reaccion.reaction) {
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
    // Obtener la referencia del documento para acceder a los archivos antiguos
    const document = doc(this._rutaAnimal, id);
    const docSnapshot = await getDoc(document);

    if (docSnapshot.exists()) {
      const animalActual = docSnapshot.data() as CrearAnimal;

      // Eliminar la imagen antigua si existe y si se proporciona una nueva imagen
      if (imagenFile && animalActual.imagen) {
        const oldImageRef = ref(this._storage, animalActual.imagen);
        await deleteObject(oldImageRef).catch((error) => {
          console.warn('No se pudo eliminar la imagen anterior:', error);
        });
      }

      // Eliminar el video antiguo si existe y si se proporciona un nuevo video
      if (videoFile && animalActual.video) {
        const oldVideoRef = ref(this._storage, animalActual.video);
        await deleteObject(oldVideoRef).catch((error) => {
          console.warn('No se pudo eliminar el video anterior:', error);
        });
      }

      // Eliminar el audio antiguo si existe y si se proporciona un nuevo audio
      if (audioFile && animalActual.audio) {
        const oldAudioRef = ref(this._storage, animalActual.audio);
        await deleteObject(oldAudioRef).catch((error) => {
          console.warn('No se pudo eliminar el audio anterior:', error);
        });
      }

      // Subir los nuevos archivos solo si se proporcionan
      const imageUrl = imagenFile ? await this.uploadImage(imagenFile) : animalActual.imagen;
      const videoUrl = videoFile ? await this.uploadVideo(videoFile) : animalActual.video || '';
      const audioUrl = audioFile ? await this.uploadAudio(audioFile) : animalActual.audio || '';

      // Actualizar los datos del animal con los nuevos archivos (o mantener los actuales)
      const animalData = {
        ...animal,
        imagen: imageUrl,
        video: videoUrl,
        audio: audioUrl
      };

      // Actualizar el documento en Firestore
      return updateDoc(document, animalData);
    } else {
      throw new Error('Animal no encontrado');
    }
  }


  async editarPregunta(id: string, pregunta: CrearPregunta) {

    const preguntaData = {
      ...pregunta,

    };

    const document = doc(this._rutaPreguntas, id);
    return updateDoc(document, preguntaData);
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

  async eliminarPregunta(id: string): Promise<void> {
    const pregunta = doc(this._rutaPreguntas, id);
    const preguntaSnapshot = await getDoc(pregunta);

    if (preguntaSnapshot.exists()) {
      const animalData = preguntaSnapshot.data() as PreguntaTrivia;

      await deleteDoc(pregunta);
    } else {
      throw new Error('Pregunta no encontrada');
    }
  }


  async buscarAnimales(term: string): Promise<Animal[]> {

    const q1 = query(
      this._rutaAnimal,
      where('nombre_comun', '>=', term),
      where('nombre_comun', '<=', term + '\uf8ff')
    );

    const q2 = query(
      this._rutaAnimal,
      where('nombre_cientifico', '>=', term),
      where('nombre_cientifico', '<=', term + '\uf8ff')
    );

    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    // Unir los resultados de ambas consultas
    const animales1 = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as Animal));
    const animales2 = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as Animal));

    // Eliminar duplicados combinando ambas listas y filtrando por ID único
    const allAnimales = [...animales1, ...animales2];
    const uniqueAnimales = Array.from(new Set(allAnimales.map(a => a.id)))
      .map(id => allAnimales.find(a => a.id === id)!);

    return uniqueAnimales;
  }

  createPreguntaTrivia(pregunta: CrearPregunta) {
    return addDoc(this._rutaPreguntas, pregunta);
  }




  obtenerVisitantesHoy(): Observable<number> {
    const hoy = format(new Date(), 'yyyy-MM-dd', { locale: es });
    const visitantesQuery = query(this.boletasUsadasRef,
                                  where('fecha', '>=', hoy + 'T00:00:00.000Z'),
                                  where('fecha', '<=', hoy + 'T23:59:59.999Z'));

    // Usamos onSnapshot para escuchar los cambios en tiempo real
    return new Observable<number>((observer) => {
      const unsubscribe = onSnapshot(visitantesQuery, (snapshot) => {
        observer.next(snapshot.size);  // Emitimos el número de visitantes
      }, (error) => {
        observer.error(error);  // Manejo de errores
      });

      // Cleanup al dejar de escuchar
      return () => unsubscribe();
    });
  }


}
