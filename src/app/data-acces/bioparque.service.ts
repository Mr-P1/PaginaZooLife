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


export interface Bioparque {
  id:string
  imagen:string,
  audio:string,
  video:string,
  nombre:string,
  familia:string,
  altura:string,
  distribucion:string,
  zonas:string,
  relacion_entorno:string

}

export interface PlantaConValoraciones extends Bioparque {
  likes: number;
  dislikes: number;
}

export interface Reaccion {
  id: string;
  plantaId: string;  // ID del animal al que le dieron like/dislike
  userId: string;  // ID del usuario que reaccionó
  reaction: boolean;   // true para like, false para dislike
}



//Lo siguiente tiene para omitir el id porque recien lo vamos a crear
export type CrearBioparque = Omit<Bioparque, 'id'>


const PATH_Bioparque = 'Bioparque'
const PATH_Reacciones = 'ReaccionesPlantas'


@Injectable({
  providedIn: 'root'
})
export class  BioparqueService {
  constructor() { }


  private _firestore = inject(Firestore);
  private _rutaBioparque = collection(this._firestore, PATH_Bioparque);
  private _rutaReaccionesPlantas = collection(this._firestore, PATH_Reacciones);
  private _storage = inject(Storage); // Agrega Storage


  async getBioparquePaginados(pageSize: number, lastVisibleDoc: any = null): Promise<{ bioparque: Bioparque[], lastVisible: any, firstVisible: any }> {
    let q;
    if (lastVisibleDoc) {
      q = query(this._rutaBioparque, orderBy('nombre'), startAfter(lastVisibleDoc), limit(pageSize));
    } else {
      q = query(this._rutaBioparque, orderBy('nombre'), limit(pageSize));
    }

    const snapshot = await getDocs(q);
    const bioparque = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Bioparque[];
    const lastVisible = snapshot.docs[snapshot.docs.length - 1]; // Cambia el nombre aquí
    const firstVisible = snapshot.docs[0]; // Cambia el nombre aquí

    return { bioparque, lastVisible, firstVisible };
  }

  // Obtener la página anterior
  async getBioparquePaginadosAnterior(pageSize: number, firstVisibleDoc: any): Promise<{ bioparque: Bioparque[], lastVisible: any, firstVisible: any }> {
    const q = query(this._rutaBioparque, orderBy('nombre'), startAt(firstVisibleDoc), limit(pageSize));

    const snapshot = await getDocs(q);
    const bioparque = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Bioparque[];
    const lastVisible = snapshot.docs[snapshot.docs.length - 1]; // Cambia el nombre aquí
    const firstVisible = snapshot.docs[0]; // Cambia el nombre aquí

    return { bioparque, lastVisible, firstVisible };
  }


  async buscarBioparque(term: string): Promise<Bioparque[]> {

    const q1 = query(
      this._rutaBioparque,
      where('nombre', '>=', term),
      where('nombre', '<=', term + '\uf8ff')
    );
    const q2 = query(
      this._rutaBioparque,
      where('distribucion', '>=', term),
      where('distribucion', '<=', term + '\uf8ff')
    );

    const q3 = query(
      this._rutaBioparque,
      where('familia', '>=', term),
      where('familia', '<=', term + '\uf8ff')
    );


    const [snapshot1, snapshot2,snapshot3] = await Promise.all([getDocs(q1), getDocs(q2),getDocs(q3)]);

    // Unir los resultados de ambas consultas
    const bioparque1 = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bioparque));
    const bioparque2 = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bioparque));
    const bioparque3 = snapshot3.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bioparque));


    // Eliminar duplicados combinando ambas listas y filtrando por ID único
    const allBioparque = [...bioparque1, ...bioparque2, ...bioparque3];
    const uniqueBioparque = Array.from(new Set(allBioparque.map(a => a.id)))
      .map(id => allBioparque.find(a => a.id === id)!);

    return uniqueBioparque;
  }



  async uploadImage(file: File): Promise<string> {
    const filePath = `Bioparque/${file.name}`; // Ruta donde se almacenará la imagen en Cloud Storage
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



  async createBioparque(bioparque: CrearBioparque, imagenFile: File, videoFile?: File, audioFile?: File) {
    // Sube la imagen, video y audio
    const imageUrl = await this.uploadImage(imagenFile);
    const videoUrl = videoFile ? await this.uploadVideo(videoFile) : '';
    const audioUrl = audioFile ? await this.uploadAudio(audioFile) : '';

    const bioparqueData = {
      ...bioparque,
      imagen: imageUrl,
      video: videoUrl,
      audio: audioUrl

    };
    return addDoc(this._rutaBioparque, bioparqueData);
  }





  async editarBioparque(id: string, bioparque: CrearBioparque, imagenFile?: File, videoFile?: File, audioFile?: File) {
    // Obtener la referencia del documento para acceder a los archivos antiguos
    const document = doc(this._rutaBioparque, id);
    const docSnapshot = await getDoc(document);

    if (docSnapshot.exists()) {
      const bioparqueActual = docSnapshot.data() as CrearBioparque;

      // Eliminar la imagen antigua si existe y si se proporciona una nueva imagen
      if (imagenFile && bioparqueActual.imagen) {
        const oldImageRef = ref(this._storage, bioparqueActual.imagen);
        await deleteObject(oldImageRef).catch((error) => {
          console.warn('No se pudo eliminar la imagen anterior:', error);
        });
      }

      // Eliminar el video antiguo si existe y si se proporciona un nuevo video
      if (videoFile && bioparqueActual.video) {
        const oldVideoRef = ref(this._storage, bioparqueActual.video);
        await deleteObject(oldVideoRef).catch((error) => {
          console.warn('No se pudo eliminar el video anterior:', error);
        });
      }

      // Eliminar el audio antiguo si existe y si se proporciona un nuevo audio
      if (audioFile && bioparqueActual.audio) {
        const oldAudioRef = ref(this._storage, bioparqueActual.audio);
        await deleteObject(oldAudioRef).catch((error) => {
          console.warn('No se pudo eliminar el audio anterior:', error);
        });
      }

      // Subir los nuevos archivos solo si se proporcionan
      const imageUrl = imagenFile ? await this.uploadImage(imagenFile) : bioparqueActual.imagen;
      const videoUrl = videoFile ? await this.uploadVideo(videoFile) : bioparqueActual.video || '';
      const audioUrl = audioFile ? await this.uploadAudio(audioFile) : bioparqueActual.audio || '';

      // Actualizar los datos del bioparque con los nuevos archivos (o mantener los actuales)
      const bioparqueData = {
        ...bioparque,
        imagen: imageUrl,
        video: videoUrl,
        audio: audioUrl
      };

      // Actualizar el documento en Firestore
      return updateDoc(document, bioparqueData);
    } else {
      throw new Error('Bioparque no encontrado');
    }
  }






  getBioparque(id: string): Observable<Bioparque | null> {
    const docRef = doc(this._rutaBioparque, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as Bioparque : null)
    );
  }


  async eliminarBioparque(id: string): Promise<void> {
    // Obtener el documento del bioparque
    const bioparqueDoc = doc(this._rutaBioparque, id);
    const bioparqueSnapshot = await getDoc(bioparqueDoc);

    if (bioparqueSnapshot.exists()) {
      const bioparqueData = bioparqueSnapshot.data() as Bioparque;

      // Eliminar imagen de Firebase Storage si existe
      if (bioparqueData.imagen) {
        const imageRef = ref(this._storage, bioparqueData.imagen);
        await deleteObject(imageRef).catch(() => {
          console.warn(`No se pudo eliminar la imagen: ${bioparqueData.imagen}`);
        });
      }

      // Eliminar video de Firebase Storage si existe
      if (bioparqueData.video) {
        const videoRef = ref(this._storage, bioparqueData.video);
        await deleteObject(videoRef).catch(() => {
          console.warn(`No se pudo eliminar el video: ${bioparqueData.video}`);
        });
      }

      // Eliminar audio de Firebase Storage si existe
      if (bioparqueData.audio) {
        const audioRef = ref(this._storage, bioparqueData.audio);
        await deleteObject(audioRef).catch(() => {
          console.warn(`No se pudo eliminar el audio: ${bioparqueData.audio}`);
        });
      }

      // Finalmente, eliminar el documento del bioparque en Firestore
      await deleteDoc(bioparqueDoc);
    } else {
      throw new Error('Bioparque no encontrado');
    }
  }


  getPlantasConValoraciones(): Observable<PlantaConValoraciones[]> {
    return new Observable((observer) => {
      const unsubscribePlantas = onSnapshot(this._rutaBioparque, (plantasSnapshot) => {
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
