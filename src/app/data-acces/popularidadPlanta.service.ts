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



export interface Planta {
  id: string;
  altura: string; // Altura de la planta
  area: string; // Área donde se encuentra
  audio: string; // URL del audio asociado
  cuidados: string; // Cuidados específicos de la planta
  curiosidad: string; // Curiosidades sobre la planta
  descripcion_1: string; // Descripción general de la planta
  descripcion_2: string; // Descripción sobre la distribución y hábitat
  descripcion_3: string; // Descripción detallada de la planta
  estado: string; // Estado de conservación según la UICN
  familia: string; // Familia botánica de la planta
  floracion: string; // Información sobre la floración
  imagen: string; // URL de la imagen de la planta
  importancia: string; // Importancia ecológica o cultural
  nombre_cientifico: string; // Nombre científico
  nombre_comun: string; // Nombre común
  peso: string; // Peso (si aplica)
  posicion_mapa: number; // Posición en el mapa
  precaucion: string; // Precauciones o adaptaciones
  usos: string; // Usos conocidos
  video: string; // URL del video asociado
  zonas: string; // Zonas geográficas donde se encuentra
}

export interface PlantaReaction {
  plantaId: string;      // ID único del animal
  fecha: Timestamp;           // Fecha y hora de la reacción (convertida de timestamp)
  reaction: boolean;     // Reacción (true para positiva, false para negativa)
  tipo: string;          // Tipo de usuario (por ejemplo, "adulto")
  userId: string;        // ID del usuario que realizó la reacción
}


const PATH_Animal = 'Plantas';
const PATH_Reacciones = 'ReaccionesPlantas';



@Injectable({
  providedIn: 'root'
})
export class PopularidadPlantaService {
  constructor(private http: HttpClient) {}

  private _firestore = inject(Firestore);
  public _rutaPlanta = collection(this._firestore, 'Plantas');
  private _rutaReaccionesPlantas = collection(this._firestore, 'ReaccionesPlantas');

  obtenerPlantaPorId(id: string): Observable<Planta | null> {
    const docRef = doc(this._rutaPlanta, id);
    return from(getDoc(docRef)).pipe(
      map((docSnapshot) => {
        return docSnapshot.exists() ? (docSnapshot.data() as Planta) : null;
      })
    );
  }

  obtenerReaccionesPlantaPorAno(plantaId: string, ano: number): Observable<{ labels: string[]; likes: number[]; dislikes: number[] }> {
    const reaccionesQuery = query(
      this._rutaReaccionesPlantas,
      where('plantaId', '==', plantaId)
    );

    return from(getDocs(reaccionesQuery)).pipe(
      map((snapshot) => {
        const likes = Array(12).fill(0);
        const dislikes = Array(12).fill(0);

        snapshot.forEach((doc) => {
          const data = doc.data() as PlantaReaction;
          const mes = data.fecha.toDate().getMonth();

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
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre',
        ];

        return { labels, likes, dislikes };
      })
    );
  }

}
