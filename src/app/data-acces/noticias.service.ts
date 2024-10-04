import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, addDoc, collectionData, doc, getDoc, updateDoc, query,
  where, deleteDoc, getDocs, orderBy, limit, startAfter, startAt
} from '@angular/fire/firestore';

import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

// Modelo Noticia
export interface Noticia {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
}

// Lo siguiente tiene para omitir el id porque recien lo vamos a crear
export type CrearNoticia = Omit<Noticia, 'id'>;

const PATH_Noticias = 'Noticias';

@Injectable({
  providedIn: 'root'
})
export class Noticiaservice {
  constructor() { }

  private _firestore = inject(Firestore);
  private _rutaNoticias = collection(this._firestore, PATH_Noticias);
  private _storage = inject(Storage); // Agrega Storage

  // Obtener noticias paginadas
  async getNoticiasPaginadas(pageSize: number, lastVisibleDoc: any = null): Promise<{ noticias: Noticia[], lastVisible: any, firstVisible: any }> {
    let q;
    if (lastVisibleDoc) {
      q = query(this._rutaNoticias, orderBy('nombre'), startAfter(lastVisibleDoc), limit(pageSize));
    } else {
      q = query(this._rutaNoticias, orderBy('nombre'), limit(pageSize));
    }

    const snapshot = await getDocs(q);
    const noticias = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Noticia[];
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const firstVisible = snapshot.docs[0];

    return { noticias, lastVisible, firstVisible };
  }

  // Obtener la página anterior de noticias
  async getNoticiasPaginadasAnterior(pageSize: number, firstVisibleDoc: any): Promise<{ noticias: Noticia[], lastVisible: any, firstVisible: any }> {
    const q = query(this._rutaNoticias, orderBy('nombre'), startAt(firstVisibleDoc), limit(pageSize));

    const snapshot = await getDocs(q);
    const noticias = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Noticia[];
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const firstVisible = snapshot.docs[0];

    return { noticias, lastVisible, firstVisible };
  }

  // Buscar noticias por término
  async buscarNoticias(term: string): Promise<Noticia[]> {
    const q = query(
      this._rutaNoticias,
      where('nombre', '>=', term),
      where('nombre', '<=', term + '\uf8ff')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Noticia[];
  }

  // Subir imagen a Firebase Storage
  async uploadImage(file: File): Promise<string> {
    const filePath = `Noticias/${file.name}`; // Ruta donde se almacenará la imagen en Cloud Storage
    const storageRef = ref(this._storage, filePath);
    const snapshot = await uploadBytes(storageRef, file); // Sube el archivo
    return getDownloadURL(snapshot.ref); // Obtiene la URL pública de la imagen
  }

  // Crear nueva noticia
  async createNoticia(noticia: CrearNoticia, imagenFile: File) {
    const imageUrl = await this.uploadImage(imagenFile);

    const noticiaData = {
      ...noticia,
      imagen: imageUrl,
    };
    return addDoc(this._rutaNoticias, noticiaData);
  }

  // Editar noticia existente
  async editarNoticia(id: string, noticia: CrearNoticia, imagenFile?: File) {
    const document = doc(this._rutaNoticias, id);
    const docSnapshot = await getDoc(document);

    if (docSnapshot.exists()) {
      const noticiaActual = docSnapshot.data() as Noticia;

      // Eliminar la imagen anterior si existe y si se proporciona una nueva imagen
      if (imagenFile && noticiaActual.imagen) {
        const oldImageRef = ref(this._storage, noticiaActual.imagen);
        await deleteObject(oldImageRef).catch((error) => {
          console.warn('No se pudo eliminar la imagen anterior:', error);
        });
      }

      // Subir la nueva imagen solo si se proporciona
      const imageUrl = imagenFile ? await this.uploadImage(imagenFile) : noticiaActual.imagen;

      const noticiaData = {
        ...noticia,
        imagen: imageUrl,
      };

      return updateDoc(document, noticiaData);
    } else {
      throw new Error('Noticia no encontrada');
    }
  }

  // Obtener todas las noticias
  getNoticias(): Observable<Noticia[]> {
    return collectionData(this._rutaNoticias, { idField: 'id' }) as Observable<Noticia[]>;
  }

  // Obtener una noticia específica
  getNoticia(id: string): Observable<Noticia | null> {
    const docRef = doc(this._rutaNoticias, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as Noticia : null)
    );
  }

  // Eliminar noticia
  async eliminarNoticia(id: string): Promise<void> {
    const noticiaDoc = doc(this._rutaNoticias, id);
    const noticiaSnapshot = await getDoc(noticiaDoc);

    if (noticiaSnapshot.exists()) {
      const noticiaData = noticiaSnapshot.data() as Noticia;

      // Eliminar imagen de Firebase Storage si existe
      if (noticiaData.imagen) {
        const imageRef = ref(this._storage, noticiaData.imagen);
        await deleteObject(imageRef).catch(() => {
          console.warn(`No se pudo eliminar la imagen: ${noticiaData.imagen}`);
        });
      }

      // Finalmente, eliminar el documento de la noticia en Firestore
      await deleteDoc(noticiaDoc);
    } else {
      throw new Error('Noticia no encontrada');
    }
  }
}
