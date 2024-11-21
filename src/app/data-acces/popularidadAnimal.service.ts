import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore, collection, addDoc, collectionData, doc, getDoc, updateDoc, query,
  where, deleteDoc, getDocs, orderBy, limit, startAfter, DocumentData,
  startAt, setDoc,QueryConstraint,
  onSnapshot
} from '@angular/fire/firestore';

import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { catchError, Observable, tap, throwError, from } from 'rxjs';
import { AuthStateService } from './auth-state.service';
import { map } from 'rxjs/operators';
import { startOfDay, endOfDay, startOfYear, endOfYear } from 'date-fns';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';



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
  area: string,
  estado_conservacion: string,
  clase: string,
  posicion_mapa: number,
  cuidados: string,
  disponibilidad: string,
  imagen: string,
  video?: string;
  audio?: string;
  audioAnimal?: string,
}

export interface AnimalReaction {
  animalId: string;      // ID único del animal
  fecha: Timestamp;           // Fecha y hora de la reacción (convertida de timestamp)
  reaction: boolean;     // Reacción (true para positiva, false para negativa)
  tipo: string;          // Tipo de usuario (por ejemplo, "adulto")
  userId: string;        // ID del usuario que realizó la reacción
}

export interface AnimalVisto {
  animalId: string;          // ID único del animal
  area: string;              // Área donde fue visto el animal
  metodoIngreso: string;     // Método de ingreso ("card", etc.)
  userId: string;            // ID del usuario que vio al animal
  vistoEn: Timestamp;             // Fecha y hora en la que el animal fue visto
}


const PATH_Animal = 'Animales';
const PATH_Reacciones = 'Reacciones';



@Injectable({
  providedIn: 'root'
})
export class PopularidadAnimalService {
  constructor(private http: HttpClient) { }

  private _firestore = inject(Firestore);
  public _rutaAnimal = collection(this._firestore, PATH_Animal);
  private _rutaReacciones = collection(this._firestore, PATH_Reacciones);


  obtenerAnimalPorId(id: string): Observable<Animal | null> {
    const docRef = doc(this._rutaAnimal, id);
    return from(getDoc(docRef)).pipe(
      map((docSnapshot) => {
        return docSnapshot.exists() ? (docSnapshot.data() as Animal) : null;
      })
    );
  }

  obtenerReaccionesPorAno(animalId: string, ano: number): Observable<{ labels: string[]; likes: number[]; dislikes: number[] }> {
    const reaccionesQuery = query(
      this._rutaReacciones,
      where('animalId', '==', animalId)
    );

    // Filtrar en el cliente después de obtener los datos
    return from(getDocs(reaccionesQuery)).pipe(
      map((snapshot) => {
        const likes = Array(12).fill(0);
        const dislikes = Array(12).fill(0);

        snapshot.forEach((doc) => {
          const data = doc.data() as AnimalReaction;
          const mes = data.fecha.toDate().getMonth(); // Obtener el mes (0-indexed)

          if (
            data.fecha.toDate() >= new Date(ano, 0, 1) &&
            data.fecha.toDate() <= new Date(ano, 11, 31, 23, 59, 59)
          ) {
            if (data.reaction) {
              likes[mes]++;
            } else {
              dislikes[mes]++;
            }
          }
        });

        const labels = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
        ];

        return { labels, likes, dislikes };
      })
    );

  }



}
