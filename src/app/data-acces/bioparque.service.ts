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
import { map } from 'rxjs/operators';

export interface Planta {
  id: string;
  imagen: string;
  audio?: string;
  video?: string;
  nombre_comun: string;
  nombre_cientifico: string;
  area:string,
  familia: string;
  altura: string;
  peso:string;
  descripcion_1: string;
  descripcion_2: string;
  descripcion_3: string;
  zonas: string;
  usos: string;
  cuidados: string; // cuidados buin zoo
  floracion: string;
  importancia: string;
  estado: string;
  curiosidad: string;
  precaucion: string;
  posicion_mapa: number;
}

export interface PlantaConValoraciones extends Planta {
  likes: number;
  dislikes: number;
}

export interface Reaccion {
  id: string;
  plantaId: string;  // ID de la planta a la que se reaccionó
  userId: string;  // ID del usuario que reaccionó
  reaction: boolean;   // true para like, false para dislike
}


export type CrearPlanta = Omit<Planta, 'id'>

const PATH_PLANTAS = 'Plantas';
const PATH_Reacciones = 'ReaccionesPlantas';

@Injectable({
  providedIn: 'root',
})
export class PlantaService {
  constructor() {}

  private _firestore = inject(Firestore);
  private _rutaPlantas = collection(this._firestore, PATH_PLANTAS);
  private _rutaReaccionesPlantas = collection(this._firestore, PATH_Reacciones);
  private _storage = inject(Storage); // Agrega Storage

  getPlanta(id: string): Observable<Planta | null> {
    const docRef = doc(this._rutaPlantas, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as Planta : null)
    );
  }


  getAnimales(): Observable<Planta[]> {
    return collectionData(this._rutaPlantas, { idField: 'id' }) as Observable<Planta[]>;
  }


  async getPlantasPaginadas(pageSize: number, lastVisibleDoc: any = null): Promise<{ plantas: Planta[], lastVisible: any, firstVisible: any }> {
    let q;
    if (lastVisibleDoc) {
      q = query(this._rutaPlantas, orderBy('nombre_comun'), startAfter(lastVisibleDoc), limit(pageSize));
    } else {
      q = query(this._rutaPlantas, orderBy('nombre_comun'), limit(pageSize));
    }

    const snapshot = await getDocs(q);
    const plantas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Planta[];
    const lastVisible = snapshot.docs[snapshot.docs.length - 1]; // Cambia el nombre aquí
    const firstVisible = snapshot.docs[0]; // Cambia el nombre aquí

    return { plantas, lastVisible, firstVisible };
  }

  async getPlantasPaginadasAnterior(pageSize: number, firstVisibleDoc: any): Promise<{ plantas: Planta[], lastVisible: any, firstVisible: any }> {
    const q = query(this._rutaPlantas, orderBy('nombre_comun'), startAt(firstVisibleDoc), limit(pageSize));

    const snapshot = await getDocs(q);
    const plantas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Planta[];
    const lastVisible = snapshot.docs[snapshot.docs.length - 1]; // Cambia el nombre aquí
    const firstVisible = snapshot.docs[0]; // Cambia el nombre aquí

    return { plantas, lastVisible, firstVisible };
  }

  async buscarPlantas(term: string): Promise<Planta[]> {
    const q1 = query(
      this._rutaPlantas,
      where('nombre_comun', '>=', term),
      where('nombre_comun', '<=', term + '\uf8ff')
    );
    const q2 = query(
      this._rutaPlantas,
      where('nombre_cientifico', '>=', term),
      where('nombre_cientifico', '<=', term + '\uf8ff')
    );

    const q3 = query(
      this._rutaPlantas,
      where('familia', '>=', term),
      where('familia', '<=', term + '\uf8ff')
    );

    const [snapshot1, snapshot2, snapshot3] = await Promise.all([getDocs(q1), getDocs(q2), getDocs(q3)]);

    const plantas1 = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as Planta));
    const plantas2 = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as Planta));
    const plantas3 = snapshot3.docs.map(doc => ({ id: doc.id, ...doc.data() } as Planta));

    const allPlantas = [...plantas1, ...plantas2, ...plantas3];
    const uniquePlantas = Array.from(new Set(allPlantas.map(a => a.id)))
      .map(id => allPlantas.find(a => a.id === id)!);

    return uniquePlantas;
  }


  async uploadImage(file: File): Promise<string> {
    const filePath = `Plantas/${file.name}`; // Ruta donde se almacenará la imagen en Cloud Storage
    const storageRef = ref(this._storage, filePath);
    const snapshot = await uploadBytes(storageRef, file); // Sube el archivo
    return getDownloadURL(snapshot.ref); // Obtiene la URL pública de la imagen
  }

  async uploadVideo(file: File): Promise<string> {
    const filePath = `Plantas/videos/${file.name}`;
    const storageRef = ref(this._storage, filePath);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  }

  // Subir audio a Cloud Storage
  async uploadAudio(file: File): Promise<string> {
    const filePath = `Plantas/audios/${file.name}`;
    const storageRef = ref(this._storage, filePath);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  }


  async createPlanta(planta: CrearPlanta, imagenFile: File, videoFile?: File, audioFile?: File) {
    const imageUrl = await this.uploadImage(imagenFile);
    const videoUrl = videoFile ? await this.uploadVideo(videoFile) : '';
    const audioUrl = audioFile ? await this.uploadAudio(audioFile) : '';

    const plantaData = {
      ...planta,
      imagen: imageUrl,
      video: videoUrl,
      audio: audioUrl
    };
    return addDoc(this._rutaPlantas, plantaData);
  }

  async editarPlanta(id: string, planta: CrearPlanta, imagenFile?: File, videoFile?: File, audioFile?: File) {
    const document = doc(this._rutaPlantas, id);
    const docSnapshot = await getDoc(document);

    if (docSnapshot.exists()) {
      const plantaActual = docSnapshot.data() as Planta;

      if (imagenFile && plantaActual.imagen) {
        const oldImageRef = ref(this._storage, plantaActual.imagen);
        await deleteObject(oldImageRef).catch((error) => {
          console.warn('No se pudo eliminar la imagen anterior:', error);
        });
      }

      if (videoFile && plantaActual.video) {
        const oldVideoRef = ref(this._storage, plantaActual.video);
        await deleteObject(oldVideoRef).catch((error) => {
          console.warn('No se pudo eliminar el video anterior:', error);
        });
      }

      if (audioFile && plantaActual.audio) {
        const oldAudioRef = ref(this._storage, plantaActual.audio);
        await deleteObject(oldAudioRef).catch((error) => {
          console.warn('No se pudo eliminar el audio anterior:', error);
        });
      }

      const imageUrl = imagenFile ? await this.uploadImage(imagenFile) : plantaActual.imagen;
      const videoUrl = videoFile ? await this.uploadVideo(videoFile) : plantaActual.video || '';
      const audioUrl = audioFile ? await this.uploadAudio(audioFile) : plantaActual.audio || '';

      const plantaData = {
        ...planta,
        imagen: imageUrl,
        video: videoUrl,
        audio: audioUrl
      };

      return updateDoc(document, plantaData);
    } else {
      throw new Error('Planta no encontrada');
    }
  }

  async eliminarPlanta(id: string): Promise<void> {
    // Obtener el documento de la planta
    const plantaDoc = doc(this._rutaPlantas, id);
    const plantaSnapshot = await getDoc(plantaDoc);

    if (plantaSnapshot.exists()) {
      const plantaData = plantaSnapshot.data() as Planta;

      // Eliminar imagen de Firebase Storage si existe
      if (plantaData.imagen) {
        const imageRef = ref(this._storage, plantaData.imagen);
        await deleteObject(imageRef).catch(() => {
          console.warn(`No se pudo eliminar la imagen: ${plantaData.imagen}`);
        });
      }

      // Eliminar video de Firebase Storage si existe
      if (plantaData.video) {
        const videoRef = ref(this._storage, plantaData.video);
        await deleteObject(videoRef).catch(() => {
          console.warn(`No se pudo eliminar el video: ${plantaData.video}`);
        });
      }

      // Eliminar audio de Firebase Storage si existe
      if (plantaData.audio) {
        const audioRef = ref(this._storage, plantaData.audio);
        await deleteObject(audioRef).catch(() => {
          console.warn(`No se pudo eliminar el audio: ${plantaData.audio}`);
        });
      }

      // Finalmente, eliminar el documento de la planta en Firestore
      await deleteDoc(plantaDoc);
    } else {
      throw new Error('Planta no encontrada');
    }
  }


  getPlantasConValoraciones(): Observable<PlantaConValoraciones[]> {
    return new Observable((observer) => {
      const unsubscribePlantas = onSnapshot(this._rutaPlantas, (plantasSnapshot) => {
        const plantas = plantasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PlantaConValoraciones[];

        const unsubscribeReacciones = onSnapshot(this._rutaReaccionesPlantas, (reaccionesSnapshot) => {
          const conteo: { [key: string]: { likes: number; dislikes: number } } = {};

          reaccionesSnapshot.docs.forEach((doc) => {
            const reaccion = doc.data() as Reaccion;
            const id = reaccion.plantaId;

            if (!conteo[id]) {
              conteo[id] = { likes: 0, dislikes: 0 };
            }
            if (reaccion.reaction) {
              conteo[id].likes++;
            } else {
              conteo[id].dislikes++;
            }
          });

          const resultado = plantas.map((planta) => ({
            ...planta,
            likes: conteo[planta.id]?.likes || 0,
            dislikes: conteo[planta.id]?.dislikes || 0,
          }));

          observer.next(resultado);
        });

        return () => unsubscribeReacciones();
      });

      return () => unsubscribePlantas();
    });
  }
}
