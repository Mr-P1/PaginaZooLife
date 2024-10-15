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
  area:string,
  estado_conservacion: string,
  clase: string,
  posicion_mapa: number,
  cuidados: string,
  disponibilidad: string,
  imagen: string,
  video?: string;
  audio?: string;
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


//Lo siguiente tiene para omitir el id porque recien lo vamos a crear
export type CrearAnimal = Omit<Animal, 'id'>
export type CambiarMapa = Omit<Mapa, 'id'>



const PATH_Animal = 'Animales';
const PATH_Mapa = 'Mapa';
const PATH_Reacciones = 'Reacciones';
const PATH_Animalesvistos = "AnimalesVistos"



@Injectable({
  providedIn: 'root'
})
export class AnimalesService {

  constructor() { }

  private _firestore = inject(Firestore);
  public _rutaAnimal = collection(this._firestore, PATH_Animal);

  private _rutaMapa = collection(this._firestore, PATH_Mapa);
  private _rutaReacciones = collection(this._firestore, PATH_Reacciones);
  public _rutaAnimalesVistos = collection(this._firestore, PATH_Animalesvistos);
  private boletasUsadasRef = collection(this._firestore, 'Boletas_usadas');


  private _authState = inject(AuthStateService);
  private _storage = inject(Storage); // Agrega Storage

  getAnimales(): Observable<Animal[]> {
    return collectionData(this._rutaAnimal, { idField: 'id' }) as Observable<Animal[]>;
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




  getAnimal(id: string): Observable<Animal | null> {
    const docRef = doc(this._rutaAnimal, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as Animal : null)
    );
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



  getAnimalesConValoraciones(): Observable<AnimalConValoraciones[]> {
    return new Observable((observer) => {
      const unsubscribeAnimales = onSnapshot(this._rutaAnimal, (animalesSnapshot) => {
        const animales = animalesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AnimalConValoraciones[];

        const unsubscribeReacciones = onSnapshot(this._rutaReacciones, (reaccionesSnapshot) => {
          const conteo: { [key: string]: { likes: number; dislikes: number } } = {};

          reaccionesSnapshot.docs.forEach((doc) => {
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

          const resultado = animales.map((animal) => ({
            ...animal,
            likes: conteo[animal.id]?.likes || 0,
            dislikes: conteo[animal.id]?.dislikes || 0,
          }));

          observer.next(resultado);
        });

        return () => unsubscribeReacciones();
      });

      return () => unsubscribeAnimales();
    });
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



  async getAreasMasVisitadas(): Promise<{ area: string, count: number }[]> {
    // Predefinir las áreas existentes
    const areasDisponibles = ['Selva Tropical', 'Sabana Africana', 'Acuario', 'Montañas'];
    const conteoPorArea: { [area: string]: number } = {};

    // Inicializar todas las áreas en 0
    areasDisponibles.forEach(area => (conteoPorArea[area] = 0));

    // Obtener las visitas de animales y acumular por área
    const animalesVistosSnapshot = await getDocs(this._rutaAnimalesVistos);

    for (const vistoDoc of animalesVistosSnapshot.docs) {
      const animalVisto = vistoDoc.data() as { animalId: string };
      const animalRef = doc(this._firestore, `Animales/${animalVisto.animalId}`);
      const animalSnapshot = await getDoc(animalRef);

      if (animalSnapshot.exists()) {
        const animalData = animalSnapshot.data() as { area: string };
        const area = animalData.area;
        if (conteoPorArea[area] !== undefined) {
          conteoPorArea[area]++;
        }
      }
    }

    // Convertir el objeto en un array y ordenarlo por visitas
    return Object.entries(conteoPorArea)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count);
  }



}
