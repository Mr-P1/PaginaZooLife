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
import { Timestamp } from '@angular/fire/firestore';


export interface Oirs {
  id: string
  archivoEvidencia?: string,
  comuna: string,
  region: string,
  detalles: number,
  fechaEnvio: Timestamp,
  tipoSolicitud: string,
  esAfectado: boolean,
  userId: string

}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  nivel: number;
  puntos: number;
  patente: string;
  auth_id: string;
}


export interface RespuestaOirs {
  id: string;
  respuesta: string,
  OirsID: string,
}


//Lo siguiente tiene para omitir el id porque recien lo vamos a crear
export type CrearRespuestaOirs = Omit<RespuestaOirs, 'id'>


const PATH_Oirs = 'Oirs'
const PATH_Usuarios = 'Usuarios'



@Injectable({
  providedIn: 'root'
})
export class OirsService {
  constructor() { }


  private _firestore = inject(Firestore);
  private _rutaOirs = collection(this._firestore, PATH_Oirs);
  private _rutaUsuario = collection(this._firestore, PATH_Usuarios);

// Método para obtener un usuario por su auth_id
getUsuarioPorAuthId(authId: string): Observable<Usuario | undefined> {
  const usuarioQuery = query(this._rutaUsuario, where('auth_id', '==', authId));
  return collectionData<Usuario>(usuarioQuery, { idField: 'id' }).pipe(
    map((usuarios: Usuario[]) => usuarios.length > 0 ? usuarios[0] : undefined)
  );
}


  // Método para obtener las OIRS de tipo 'Consulta'
  getOirsConsulta(): Observable<Oirs[]> {
    const consultaQuery = query(this._rutaOirs, where('tipoSolicitud', '==', 'consulta'));
    return collectionData(consultaQuery, { idField: 'id' }) as Observable<Oirs[]>;
  }

  // Método para obtener las OIRS de tipo 'Felicitación'
  getOirsFelicitacion(): Observable<Oirs[]> {
    const felicitacionQuery = query(this._rutaOirs, where('tipoSolicitud', '==', 'felicitacion'));
    return collectionData(felicitacionQuery, { idField: 'id' }) as Observable<Oirs[]>;
  }

  // Método para obtener las OIRS de tipo 'Reclamo'
  getOirsReclamo(): Observable<Oirs[]> {
    const reclamoQuery = query(this._rutaOirs, where('tipoSolicitud', '==', 'reclamo'));
    return collectionData(reclamoQuery, { idField: 'id' }) as Observable<Oirs[]>;
  }

  // Método para obtener las OIRS de tipo 'Sugerencia'
  getOirsSugerencia(): Observable<Oirs[]> {
    const sugerenciaQuery = query(this._rutaOirs, where('tipoSolicitud', '==', 'sugerencia'));
    return collectionData(sugerenciaQuery, { idField: 'id' }) as Observable<Oirs[]>;
  }


}
