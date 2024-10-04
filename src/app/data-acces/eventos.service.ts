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

export interface evento {

  id: string,
  nombre_evento: string,
  imagen: string,
  descripcion: string,
  fecha_inicio: string,
  hora_inicio:string,
  fecha_termino: string,
  hora_termino:string
}


export type CrearEvento = Omit<evento, 'id'>
const PATH_Eventos = 'Eventos';


@Injectable({
  providedIn: 'root'
})
export class EventoService {

  private _firestore = inject(Firestore);
  private _rutaEventos = collection(this._firestore, PATH_Eventos);
  private _storage = inject(Storage); // Agrega Storage




  getEventosPaginados(pageSize: number, lastVisibleDoc: any = null): Promise<{ eventos: evento[], lastVisible: any, firstVisible: any }> {
    let q;
    if (lastVisibleDoc) {
      q = query(this._rutaEventos, orderBy('nombre_evento'), startAfter(lastVisibleDoc), limit(pageSize));
    } else {
      q = query(this._rutaEventos, orderBy('nombre_evento'), limit(pageSize));
    }

    return getDocs(q).then(snapshot => {
      const eventos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as evento[];
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const firstVisible = snapshot.docs[0];

      return { eventos, lastVisible, firstVisible };
    });
  }

   // Obtener la página anterior Eventos
   getEventosPaginadosAnterior(pageSize: number, firstVisibleDoc: any): Promise<{ eventos: evento[], lastVisible: any, firstVisible: any }> {
    const q = query(this._rutaEventos, orderBy('nombre_evento'), startAt(firstVisibleDoc), limit(pageSize));

    return getDocs(q).then(snapshot => {
      const eventos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as evento[];
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const firstVisible = snapshot.docs[0];

      return { eventos, lastVisible, firstVisible };
    });
  }

  async uploadImage(file: File): Promise<string> {
    const filePath = `Evento/${file.name}`; // Ruta donde se almacenará la imagen en Cloud Storage
    const storageRef = ref(this._storage, filePath);
    const snapshot = await uploadBytes(storageRef, file); // Sube el archivo
    return getDownloadURL(snapshot.ref); // Obtiene la URL pública de la imagen
  }




  getEventos(): Observable<evento[]> {
    return collectionData(this._rutaEventos, { idField: 'id' }) as Observable<evento[]>;
  }

  getEvento(id: string): Observable<evento | null> {
    const docRef = doc(this._rutaEventos, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as evento : null)
    );
  }

  buscarEventos(term: string): Promise<evento[]> {
    const q = query(this._rutaEventos, where('nombre_evento', '>=', term), where('nombre_evento', '<=', term + '\uf8ff'));

    return getDocs(q).then(snapshot => {
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as evento[];
    });
  }


  async createEvento(evento: CrearEvento, imagenFile: File) {
    // Sube la imagen, video y audio
    const imageUrl = await this.uploadImage(imagenFile);

    const eventoData = {
      ...evento,
      imagen: imageUrl,

    };
    return addDoc(this._rutaEventos, eventoData);
  }




  async editarEvento(id: string, evento: CrearEvento, imagenFile?: File) {
    // Obtener la referencia del documento para acceder a la imagen anterior
    const document = doc(this._rutaEventos, id);
    const docSnapshot = await getDoc(document);

    if (docSnapshot.exists()) {
      const eventoActual = docSnapshot.data() as CrearEvento;

      // Eliminar la imagen anterior si existe y si se proporciona una nueva imagen
      if (imagenFile && eventoActual.imagen) {
        const oldImageRef = ref(this._storage, eventoActual.imagen);
        await deleteObject(oldImageRef).catch((error) => {
          console.warn('No se pudo eliminar la imagen anterior:', error);
        });
      }

      // Subir la nueva imagen solo si se proporciona
      const imageUrl = imagenFile ? await this.uploadImage(imagenFile) : eventoActual.imagen;

      // Actualizar los datos del evento con la nueva imagen (o mantener la actual)
      const eventoData = {
        ...evento,
        imagen: imageUrl,
      };

      // Actualizar el documento en Firestore
      return updateDoc(document, eventoData);
    } else {
      throw new Error('evento no encontrado');
    }
  }




  async eliminarEvento(id: string): Promise<void> {
    // Obtener el documento del animal
    const premioDoc = doc(this._rutaEventos, id);
    const premioSnapshot = await getDoc(premioDoc);

    if (premioSnapshot.exists()) {
      const premioData = premioSnapshot.data() as evento;

      // Eliminar imagen de Firebase Storage si existe
      if (premioData.imagen) {
        const imageRef = ref(this._storage, premioData.imagen);
        await deleteObject(imageRef).catch(() => {
          console.warn(`No se pudo eliminar la imagen: ${premioData.imagen}`);
        });
      }




      // Finalmente, eliminar el documento del animal en Firestore
      await deleteDoc(premioDoc);
    } else {
      throw new Error('Animal no encontrado');
    }
  }







}


