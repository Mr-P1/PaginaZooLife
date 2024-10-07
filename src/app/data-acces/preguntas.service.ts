import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, getDoc, updateDoc, query, where, deleteDoc, getDocs, orderBy, limit, startAfter, startAt } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnimalesService } from './animales.service';

export interface PreguntaTrivia {
  id: string;              // ID único de la pregunta
  pregunta: string;        // Texto de la pregunta
  respuestas: Respuestas;  // Las 4 posibles respuestas
  respuesta_correcta: string;   // Clave de la respuesta correcta (a, b, c, d)
  tipo: string;  // Tipo de pregunta: para niño o adulto
  animal_id: string;  // ID del animal asociado
}

export interface Respuestas {
  [key: string]: string;
  a: string;  // Respuesta opción A
  b: string;  // Respuesta opción B
  c: string;  // Respuesta opción C
  d: string;  // Respuesta opción D
}

// Lo siguiente es para omitir el id porque se creará al añadir la pregunta
export type CrearPregunta = Omit<PreguntaTrivia, 'id'>;

const PATH_Preguntas = 'Preguntas';
const PATH_RespuestasTrivia = 'RespuestasTrivia'

@Injectable({
  providedIn: 'root',
})
export class PreguntaService {
  private _firestore = inject(Firestore);
  private _rutaPreguntas = collection(this._firestore, PATH_Preguntas);
  private _rutaRespuestasTrivia = collection(this._firestore, PATH_RespuestasTrivia);
  private animalesService = inject(AnimalesService);

  // Crear una nueva pregunta
  createPreguntaTrivia(pregunta: CrearPregunta) {
    return addDoc(this._rutaPreguntas, pregunta);
  }

  // Obtener preguntas paginadas
  async getPreguntasPaginadas(pageSize: number, lastVisibleDoc: any = null): Promise<{ preguntas: PreguntaTrivia[], lastVisible: any, firstVisible: any }> {
    let q;
    if (lastVisibleDoc) {
      q = query(this._rutaPreguntas, orderBy('pregunta'), startAfter(lastVisibleDoc), limit(pageSize));
    } else {
      q = query(this._rutaPreguntas, orderBy('pregunta'), limit(pageSize));
    }

    const snapshot = await getDocs(q);
    const preguntas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PreguntaTrivia[];
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const firstVisible = snapshot.docs[0];

    return { preguntas, lastVisible, firstVisible };
  }

  // Obtener la página anterior de preguntas
  async getPreguntasPaginadasAnterior(pageSize: number, firstVisibleDoc: any): Promise<{ preguntas: PreguntaTrivia[], lastVisible: any, firstVisible: any }> {
    const q = query(this._rutaPreguntas, orderBy('pregunta'), startAt(firstVisibleDoc), limit(pageSize));

    const snapshot = await getDocs(q);
    const preguntas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PreguntaTrivia[];
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const firstVisible = snapshot.docs[0];

    return { preguntas, lastVisible, firstVisible };
  }

 // Buscar preguntas por término
 async buscarPreguntas(term: string): Promise<PreguntaTrivia[]> {
  // Primero buscar el animal por nombre común o científico
  const animalesEncontrados = await this.animalesService.buscarAnimales(term);

  // Extraer los IDs de los animales encontrados
  const animalIds = animalesEncontrados.map(animal => animal.id);

  if (animalIds.length === 0) {
    // Si no se encuentran animales, retornamos una lista vacía
    return [];
  }

  // Crear la consulta para buscar las preguntas asociadas a los animales encontrados
  const q1 = query(
    this._rutaPreguntas,
    where('pregunta', '>=', term),
    where('pregunta', '<=', term + '\uf8ff')
  );

  const q2 = query(
    this._rutaPreguntas,
    where('tipo', '>=', term),
    where('tipo', '<=', term + '\uf8ff')
  );

  // Consulta de preguntas basadas en el animal_id
  const q3 = query(
    this._rutaPreguntas,
    where('animal_id', 'in', animalIds)  // Usar 'in' para buscar preguntas de múltiples animales
  );

  const [snapshot1, snapshot2, snapshot3] = await Promise.all([getDocs(q1), getDocs(q2), getDocs(q3)]);

  // Unir los resultados de las consultas
  const preguntas1 = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as PreguntaTrivia));
  const preguntas2 = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as PreguntaTrivia));
  const preguntas3 = snapshot3.docs.map(doc => ({ id: doc.id, ...doc.data() } as PreguntaTrivia));

  // Eliminar duplicados combinando las listas y filtrando por ID único
  const allPreguntas = [...preguntas1, ...preguntas2, ...preguntas3];
  const uniquePreguntas = Array.from(new Set(allPreguntas.map(p => p.id)))
    .map(id => allPreguntas.find(p => p.id === id)!);

  return uniquePreguntas;
}





  // Editar pregunta
  async editarPregunta(id: string, pregunta: CrearPregunta) {
    const document = doc(this._rutaPreguntas, id);
    return updateDoc(document, pregunta);
  }

  // Obtener una pregunta específica por su ID
  getPregunta(id: string): Observable<PreguntaTrivia | null> {
    const docRef = doc(this._rutaPreguntas, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as PreguntaTrivia : null)
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

  // Obtener todas las preguntas
  getPreguntas(): Observable<PreguntaTrivia[]> {
    return collectionData(this._rutaPreguntas, { idField: 'id' }) as Observable<PreguntaTrivia[]>;
  }
}
