import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, addDoc, collectionData, doc, getDoc, updateDoc, query, where, deleteDoc, getDocs } from '@angular/fire/firestore';
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
  imagen: string
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

  getMapa(): Observable<any[]> {
    return collectionData(this._rutaMapa, { idField: 'id' }) as Observable<any[]>;
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


  editarAnimal(id: string, animal: CrearAnimal) {
    const document = doc(this._rutaAnimal, id)
    return updateDoc(document, { ...animal })
  }

  editarEvento(id: string, evento: CrearEvento) {
    const document = doc(this._rutaEventos, id)
    return updateDoc(document, { ...evento })
  }

  editarMapa(id: string, mapa: CambiarMapa) {
    const document = doc(this._rutaMapa, id)
    return updateDoc(document, { ...mapa })
  }


  eliminarAnimal(id: string) {
    const animalDoc = doc(this._rutaAnimal, id);
    return deleteDoc(animalDoc);
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



}
