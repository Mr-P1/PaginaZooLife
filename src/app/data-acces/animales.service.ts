import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {Firestore,collection,addDoc,collectionData,doc,getDoc,updateDoc,query,where, deleteDoc,} from '@angular/fire/firestore';
import { catchError, Observable, tap, throwError,from } from 'rxjs';
import { AuthStateService } from './auth-state.service';
import { map } from 'rxjs/operators';


export interface Animal {
  id: string;
  nombre_comun: string,
  nombre_cientifico: string,
  especie: string,
  estado: string,
  posicion_mapa: number,
  descripcion: string,
  curiosidad: string,
  precaucion: string,
  imagen: string,
}


//Lo siguiente tiene para omitir el id porque recien lo vamos a crear
export type CrearAnimal = Omit<Animal, 'id'>

const PATH = 'Animales';

@Injectable({
  providedIn: 'root'
})
export class AnimalesService {

  constructor() { }

  private _firestore = inject(Firestore);
  private _rutaAnimal = collection(this._firestore, PATH)
  private _authState = inject(AuthStateService);


  create(animal: CrearAnimal) {
    return addDoc(this._rutaAnimal, animal);
  }

  getAnimales(): Observable<Animal[]> {
    return collectionData(this._rutaAnimal,{idField: 'id'}) as Observable<Animal[]>;
  }

  getAnimal(id: string): Observable<Animal | null> {
    const docRef = doc(this._rutaAnimal, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as Animal : null)
    );
  }


  editarAnimal( id:string,animal:CrearAnimal){
    const document = doc(this._rutaAnimal,id)
    return updateDoc(document,{...animal})
  }


  eliminarAnimal(id: string) {
    const animalDoc = doc(this._rutaAnimal, id);
    return deleteDoc(animalDoc);
  }



}
