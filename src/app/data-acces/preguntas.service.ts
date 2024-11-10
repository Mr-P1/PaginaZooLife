import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, getDoc, updateDoc, query, where, deleteDoc, getDocs, orderBy, limit, startAfter, startAt, QueryConstraint } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnimalesService } from './animales.service';
import { PlantaService } from './bioparque.service';

export interface PreguntaTrivia {
  id: string;              // ID único de la pregunta
  pregunta: string;        // Texto de la pregunta
  respuestas: Respuestas;  // Las 4 posibles respuestas
  respuesta_correcta: string;   // Clave de la respuesta correcta (a, b, c, d)
  tipo: string;  // Tipo de pregunta: para niño o adulto
  animal_id: string;  // ID del animal asociado
}


export interface PreguntaTriviaPlantas {
  id: string;              // ID único de la pregunta
  pregunta: string;        // Texto de la pregunta
  respuestas: Respuestas;  // Las 4 posibles respuestas
  respuesta_correcta: string;   // Clave de la respuesta correcta (a, b, c, d)
  tipo: string;  // Tipo de pregunta: para niño o adulto
  planta_id: string;  // ID del animal asociado
}

export interface Respuestas {
  [key: string]: string;
  a: string;  // Respuesta opción A
  b: string;  // Respuesta opción B
  c: string;  // Respuesta opción C
  d: string;  // Respuesta opción D
}


type PreguntaUnificada = PreguntaTrivia | PreguntaTriviaPlantas;

// Lo siguiente es para omitir el id porque se creará al añadir la pregunta
export type CrearPregunta = Omit<PreguntaTrivia, 'id'>;
export type CrearPreguntaPlanta = Omit<PreguntaTriviaPlantas, 'id'>;

const PATH_Preguntas = 'Preguntas';
const PATH_PreguntasPlantas = 'PreguntasPlantas';
const PATH_RespuestasTrivia = 'RespuestasTrivia'

@Injectable({
  providedIn: 'root',
})
export class PreguntaService {
  private _firestore = inject(Firestore);
  private _rutaPreguntas = collection(this._firestore, PATH_Preguntas);
  private _rutaPreguntasPlantas = collection(this._firestore, PATH_PreguntasPlantas);
  private _rutaRespuestasTrivia = collection(this._firestore, PATH_RespuestasTrivia);
  private animalesService = inject(AnimalesService);
  private plantaService = inject(PlantaService);

  // Crear una nueva pregunta
  createPreguntaTrivia(pregunta: CrearPregunta) {
    return addDoc(this._rutaPreguntas, pregunta);
  }

  createPreguntaTriviaPlantas(pregunta: CrearPreguntaPlanta) {
    return addDoc(this._rutaPreguntasPlantas, pregunta);
  }


  // Obtener preguntas paginadas /Antiguo
  // async getPreguntasPaginadas(pageSize: number, lastVisibleDoc: any = null): Promise<{ preguntas: PreguntaTrivia[], lastVisible: any, firstVisible: any }> {
  //   let q;
  //   if (lastVisibleDoc) {
  //     q = query(this._rutaPreguntas, orderBy('pregunta'), startAfter(lastVisibleDoc), limit(pageSize));
  //   } else {
  //     q = query(this._rutaPreguntas, orderBy('pregunta'), limit(pageSize));
  //   }

  //   const snapshot = await getDocs(q);
  //   const preguntas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PreguntaTrivia[];
  //   const lastVisible = snapshot.docs[snapshot.docs.length - 1];
  //   const firstVisible = snapshot.docs[0];

  //   return { preguntas, lastVisible, firstVisible };
  // }




  // Obtener preguntas paginadas (Preguntas de Animales y Plantas combinadas)
  // Obtener preguntas paginadas (Animales y Plantas combinadas)
  async getPreguntasPaginadas(
    pageSize: number,
    lastVisibleDoc: any = null
  ): Promise<{ preguntas: PreguntaUnificada[], lastVisible: any, firstVisible: any }> {
    const constraints: QueryConstraint[] = [orderBy('pregunta'), limit(pageSize)];
    if (lastVisibleDoc) {
      constraints.push(startAfter(lastVisibleDoc));
    }

    const qAnimales = query(this._rutaPreguntas, ...constraints);
    const qPlantas = query(this._rutaPreguntasPlantas, ...constraints);

    const [snapshotAnimales, snapshotPlantas] = await Promise.all([getDocs(qAnimales), getDocs(qPlantas)]);

    const preguntasAnimales = snapshotAnimales.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PreguntaTrivia[];
    const preguntasPlantas = snapshotPlantas.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PreguntaTriviaPlantas[];

    const preguntasUnificadas: PreguntaUnificada[] = [...preguntasAnimales, ...preguntasPlantas];
    preguntasUnificadas.sort((a, b) => a.pregunta.localeCompare(b.pregunta));

    const lastVisible = snapshotAnimales.docs[snapshotAnimales.docs.length - 1] || snapshotPlantas.docs[snapshotPlantas.docs.length - 1];
    const firstVisible = snapshotAnimales.docs[0] || snapshotPlantas.docs[0];

    return { preguntas: preguntasUnificadas, lastVisible, firstVisible };
  }

  // Obtener la página anterior de preguntas /Antiguo
  // async getPreguntasPaginadasAnterior(pageSize: number, firstVisibleDoc: any): Promise<{ preguntas: PreguntaTrivia[], lastVisible: any, firstVisible: any }> {
  //   const q = query(this._rutaPreguntas, orderBy('pregunta'), startAt(firstVisibleDoc), limit(pageSize));

  //   const snapshot = await getDocs(q);
  //   const preguntas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PreguntaTrivia[];
  //   const lastVisible = snapshot.docs[snapshot.docs.length - 1];
  //   const firstVisible = snapshot.docs[0];

  //   return { preguntas, lastVisible, firstVisible };
  // }

  // Obtener la página anterior de preguntas
  async getPreguntasPaginadasAnterior(
    pageSize: number,
    firstVisibleDoc: any
  ): Promise<{ preguntas: PreguntaUnificada[], lastVisible: any, firstVisible: any }> {
    const constraints: QueryConstraint[] = [orderBy('pregunta'), startAt(firstVisibleDoc), limit(pageSize)];

    const qAnimales = query(this._rutaPreguntas, ...constraints);
    const qPlantas = query(this._rutaPreguntasPlantas, ...constraints);

    const [snapshotAnimales, snapshotPlantas] = await Promise.all([getDocs(qAnimales), getDocs(qPlantas)]);

    const preguntasAnimales = snapshotAnimales.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PreguntaTrivia[];
    const preguntasPlantas = snapshotPlantas.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PreguntaTriviaPlantas[];

    const preguntasUnificadas: PreguntaUnificada[] = [...preguntasAnimales, ...preguntasPlantas];
    preguntasUnificadas.sort((a, b) => a.pregunta.localeCompare(b.pregunta));

    const lastVisible = snapshotAnimales.docs[snapshotAnimales.docs.length - 1] || snapshotPlantas.docs[snapshotPlantas.docs.length - 1];
    const firstVisible = snapshotAnimales.docs[0] || snapshotPlantas.docs[0];

    return { preguntas: preguntasUnificadas, lastVisible, firstVisible };
  }




  // Editar pregunta
  async editarPregunta(id: string, pregunta: CrearPregunta) {
    const document = doc(this._rutaPreguntas, id);
    return updateDoc(document, pregunta);
  }

  async editarPreguntaPlanta(id: string, pregunta: CrearPreguntaPlanta) {
    const document = doc(this._rutaPreguntasPlantas, id);
    return updateDoc(document, pregunta);
  }


  // Obtener una pregunta específica por su ID
  getPregunta(id: string): Observable<PreguntaTrivia | null> {
    const docRef = doc(this._rutaPreguntas, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as PreguntaTrivia : null)
    );
  }


  getPreguntaPlanta(id: string): Observable<PreguntaTriviaPlantas | null> {
    const docRef = doc(this._rutaPreguntasPlantas, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as PreguntaTriviaPlantas : null)
    );
  }


  // Eliminar una pregunta
  async eliminarPregunta(id: string): Promise<void> {
    const preguntaDoc = doc(this._rutaPreguntas, id);
    const preguntaSnapshot = await getDoc(preguntaDoc);

    if (preguntaSnapshot.exists()) {
      await deleteDoc(preguntaDoc);
    } else {
      throw new Error('Pregunta no encontrada');
    }
  }


  async eliminarPreguntaPlanta(id: string): Promise<void> {
    const preguntaDoc = doc(this._rutaPreguntasPlantas, id);
    const preguntaSnapshot = await getDoc(preguntaDoc);

    if (preguntaSnapshot.exists()) {
      await deleteDoc(preguntaDoc);
    } else {
      throw new Error('Pregunta no encontrada');
    }
  }

  // Obtener todas las preguntas
  getPreguntas(): Observable<PreguntaTrivia[]> {
    return collectionData(this._rutaPreguntas, { idField: 'id' }) as Observable<PreguntaTrivia[]>;
  }


}
