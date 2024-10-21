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


export interface PremioTrivia {
  id:string
  imagen:string,
  nombre:string,
  descripcion:string,
  cantidad:number,
  puntos_necesarios:number

}

export interface PremioUsuario {
  id: string;
  codigo: string,
  estado: string,
  premioId: string,
  usuarioId: string,
}


//Lo siguiente tiene para omitir el id porque recien lo vamos a crear
export type CrearPremioTrivia = Omit<PremioTrivia, 'id'>


const PATH_PremiosTrivia = 'Premios_trivia'
const PATH_PremiosUsuarios = 'PremiosUsuarios';


@Injectable({
  providedIn: 'root'
})
export class  PremiosService {
  constructor() { }


  private _firestore = inject(Firestore);
  private _rutaPremiosTrivia = collection(this._firestore, PATH_PremiosTrivia);
  private _rutaPremiosUsuarios = collection(this._firestore, PATH_PremiosUsuarios);

  private _storage = inject(Storage); // Agrega Storage


  async getPremiosPaginados(pageSize: number, lastVisibleDoc: any = null): Promise<{ premios: PremioTrivia[], lastVisible: any, firstVisible: any }> {
    let q;
    if (lastVisibleDoc) {
      q = query(this._rutaPremiosTrivia, orderBy('nombre'), startAfter(lastVisibleDoc), limit(pageSize));
    } else {
      q = query(this._rutaPremiosTrivia, orderBy('nombre'), limit(pageSize));
    }

    const snapshot = await getDocs(q);
    const premios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PremioTrivia[];
    const lastVisible = snapshot.docs[snapshot.docs.length - 1]; // Cambia el nombre aquí
    const firstVisible = snapshot.docs[0]; // Cambia el nombre aquí

    return { premios, lastVisible, firstVisible };
  }

  // Obtener la página anterior
  async getPremiosPaginadosAnterior(pageSize: number, firstVisibleDoc: any): Promise<{ premios: PremioTrivia[], lastVisible: any, firstVisible: any }> {
    const q = query(this._rutaPremiosTrivia, orderBy('nombre'), startAt(firstVisibleDoc), limit(pageSize));

    const snapshot = await getDocs(q);
    const premios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PremioTrivia[];
    const lastVisible = snapshot.docs[snapshot.docs.length - 1]; // Cambia el nombre aquí
    const firstVisible = snapshot.docs[0]; // Cambia el nombre aquí

    return { premios, lastVisible, firstVisible };
  }


  async buscarPremios(term: string): Promise<PremioTrivia[]> {

    const q1 = query(
      this._rutaPremiosTrivia,
      where('nombre', '>=', term),
      where('nombre', '<=', term + '\uf8ff')
    );

    const q2 = query(
      this._rutaPremiosTrivia,
      where('puntos_necesarios', '>=', term),
      where('puntos_necesarios', '<=', term + '\uf8ff')
    );

    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    // Unir los resultados de ambas consultas
    const premios1 = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as PremioTrivia));
    const premios2 = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as PremioTrivia));

    // Eliminar duplicados combinando ambas listas y filtrando por ID único
    const allPremios = [...premios1, ...premios2];
    const uniquePremios = Array.from(new Set(allPremios.map(a => a.id)))
      .map(id => allPremios.find(a => a.id === id)!);

    return uniquePremios;
  }

  async uploadImage(file: File): Promise<string> {
    const filePath = `Premios_trivia/${file.name}`; // Ruta donde se almacenará la imagen en Cloud Storage
    const storageRef = ref(this._storage, filePath);
    const snapshot = await uploadBytes(storageRef, file); // Sube el archivo
    return getDownloadURL(snapshot.ref); // Obtiene la URL pública de la imagen
  }


  async createPremio(premio: CrearPremioTrivia, imagenFile: File) {
    // Sube la imagen, video y audio
    const imageUrl = await this.uploadImage(imagenFile);

    const premioData = {
      ...premio,
      imagen: imageUrl,

    };
    return addDoc(this._rutaPremiosTrivia, premioData);
  }

  async editarPremio(id: string, premio: CrearPremioTrivia, imagenFile?: File) {
    // Obtener la referencia del documento para acceder a la imagen anterior
    const document = doc(this._rutaPremiosTrivia, id);
    const docSnapshot = await getDoc(document);

    if (docSnapshot.exists()) {
      const premioActual = docSnapshot.data() as CrearPremioTrivia;

      // Eliminar la imagen anterior si existe y si se proporciona una nueva imagen
      if (imagenFile && premioActual.imagen) {
        const oldImageRef = ref(this._storage, premioActual.imagen);
        await deleteObject(oldImageRef).catch((error) => {
          console.warn('No se pudo eliminar la imagen anterior:', error);
        });
      }

      // Subir la nueva imagen solo si se proporciona
      const imageUrl = imagenFile ? await this.uploadImage(imagenFile) : premioActual.imagen;

      // Actualizar los datos del premio con la nueva imagen (o mantener la actual)
      const premioData = {
        ...premio,
        imagen: imageUrl,
      };

      // Actualizar el documento en Firestore
      return updateDoc(document, premioData);
    } else {
      throw new Error('Premio no encontrado');
    }
  }


  getPremio(id: string): Observable<PremioTrivia | null> {
    const docRef = doc(this._rutaPremiosTrivia, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as PremioTrivia : null)
    );
  }


  async eliminarPremio(id: string): Promise<void> {
    // Obtener el documento del animal
    const premioDoc = doc(this._rutaPremiosTrivia, id);
    const premioSnapshot = await getDoc(premioDoc);

    if (premioSnapshot.exists()) {
      const premioData = premioSnapshot.data() as PremioTrivia;

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


    // Método para obtener los premios de un usuario
    getPremiosPorUsuario(usuarioId: string): Observable<PremioUsuario[]> {
      const premiosQuery = query(this._rutaPremiosUsuarios, where('usuarioId', '==', usuarioId));
      return collectionData(premiosQuery, { idField: 'id' }) as Observable<PremioUsuario[]>;
    }

    // Método para obtener la información del premio de la colección PremioTrivia
    getPremioTriviaById(premioId: string): Observable<PremioTrivia | null> {
      const docRef = doc(this._rutaPremiosTrivia, premioId);
      return from(getDoc(docRef)).pipe(
        map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as PremioTrivia : null)
      );
    }




    async canjearPremioUsuario(premioUsuarioId: string): Promise<void> {
      try {
        const premioDocRef = doc(this._firestore, `PremiosUsuarios/${premioUsuarioId}`);
        await updateDoc(premioDocRef, { estado: false }); // Actualiza el estado a booleano
      } catch (error) {
        throw new Error('Error al canjear el premio: ' + error);
      }
    }

}
