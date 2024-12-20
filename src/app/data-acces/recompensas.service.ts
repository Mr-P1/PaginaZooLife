import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore, collection, addDoc, collectionData, doc, getDoc, updateDoc, query,
  where, deleteDoc, getDocs, orderBy, limit, startAfter, DocumentData,
  startAt, setDoc,
  onSnapshot,
  Timestamp,
  QueryConstraint
} from '@angular/fire/firestore';

import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { catchError, Observable, tap, throwError, from, forkJoin, of } from 'rxjs';
import { AuthStateService } from './auth-state.service';
import { map, switchMap } from 'rxjs/operators';



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
  estado: string, //Si es true es porque ya fue Reclamado, si es false es porque aun No se reclama
  premioId: string,
  fecha:Timestamp
  usuarioId: string, //Esto es igual a auth_id del Usuario
}


export interface Usuario {
  auth_id: string; // ID de autenticación
  comuna: string; // Comuna del usuario
  correo: string; // Correo electrónico del usuario
  fechaNacimiento: Timestamp ; // Fecha de nacimiento como objeto Date
  genero: string;
  nivel: number;
  nombre: string;
  patente: string;
  puntos: number;
  telefono: string;
}



//Lo siguiente tiene para omitir el id porque recien lo vamos a crear
export type CrearPremioTrivia = Omit<PremioTrivia, 'id'>


const PATH_PremiosTrivia = 'Premios_trivia'
const PATH_PremiosUsuarios = 'PremiosUsuarios';
const PATH_Usuarios = "Usuarios"


@Injectable({
  providedIn: 'root'
})
export class  RecompensaService {
  constructor() {}

  private _firestore = inject(Firestore);
  private _rutaPremiosTrivia = collection(this._firestore, PATH_PremiosTrivia);
  private _rutaPremiosUsuarios = collection(this._firestore, PATH_PremiosUsuarios);
  private _rutaUsuarios = collection(this._firestore, PATH_Usuarios);

  // Obtener las recompensas de usuario con filtros dinámicos
  getFilteredPremiosUsuario(estado: string): Observable<any[]> {
    const constraints: QueryConstraint[] = [];
    if (estado === 'reclamado') {
      constraints.push(where('estado', '==', false)); // Cambiado: false = Reclamado
    } else if (estado === 'noReclamado') {
      constraints.push(where('estado', '==', true)); // Cambiado: true = No Reclamado
    }

    const premiosUsuarioQuery = query(this._rutaPremiosUsuarios, ...constraints);

    return collectionData(premiosUsuarioQuery, { idField: 'id' }).pipe(
      switchMap((premiosUsuarios: PremioUsuario[]) =>
        premiosUsuarios.length > 0
          ? forkJoin(
              premiosUsuarios.map((premioUsuario) =>
                this.getPremioYUsuario(premioUsuario).pipe(
                  map((detalles) => ({ ...premioUsuario, ...detalles }))
                )
              )
            )
          : of([]) // Retorna un array vacío si no hay datos
      )
    );
  }


  // Obtener detalles de premio y usuario
  private getPremioYUsuario(premioUsuario: PremioUsuario): Observable<any> {
    const premioDoc = doc(this._rutaPremiosTrivia, premioUsuario.premioId);
    const usuarioDoc = doc(this._rutaUsuarios, premioUsuario.usuarioId);

    return forkJoin({
      premio: from(getDoc(premioDoc)).pipe(map((doc) => doc.data())),
      usuario: from(getDoc(usuarioDoc)).pipe(map((doc) => doc.data())),
    });
  }

  // Actualizar estado de la recompensa a "reclamado"
  actualizarEstadoPremio(idPremioUsuario: string): Promise<void> {
    const premioUsuarioDoc = doc(this._rutaPremiosUsuarios, idPremioUsuario);
    return updateDoc(premioUsuarioDoc, { estado: false });
  }


  getPremiosPorAno(ano: number): Observable<{ labels: string[]; data: { [key: string]: number[] } }> {
    const inicioAno = new Date(ano, 0, 1); // Inicio del año
    const finAno = new Date(ano, 11, 31, 23, 59, 59); // Fin del año

    const premiosQuery = query(
      this._rutaPremiosUsuarios,
      where('fecha', '>=', Timestamp.fromDate(inicioAno)),
      where('fecha', '<=', Timestamp.fromDate(finAno))
    );

    return collectionData(premiosQuery, { idField: 'id' }).pipe(
      switchMap((premiosUsuarios: PremioUsuario[]) =>
        premiosUsuarios.length > 0
          ? forkJoin(
              premiosUsuarios.map((premioUsuario) =>
                this.getPremioDetalles(premioUsuario.premioId).pipe(
                  map((premio) => ({
                    ...premioUsuario,
                    premioNombre: premio?.nombre || 'Desconocido', // Agrega el nombre del premio
                    fecha: premioUsuario.fecha.toDate(),
                  }))
                )
              )
            )
          : of([])
      ),
      map((premiosDetallados: any[]) => {
        const data: { [key: string]: number[] } = {};
        const labels = Array(12).fill(0).map((_, i) =>
          new Date(0, i).toLocaleString('es', { month: 'long' })
        );

        // Organizar premios por mes
        premiosDetallados.forEach((premio) => {
          const mes = premio.fecha.getMonth(); // Mes (0-11)
          const premioNombre = premio.premioNombre;

          if (!data[premioNombre]) {
            data[premioNombre] = Array(12).fill(0);
          }
          data[premioNombre][mes]++;
        });

        return { labels, data };
      })
    );
  }

  // Obtener los detalles del premio desde la colección PremiosTrivia
  private getPremioDetalles(premioId: string): Observable<PremioTrivia | undefined> {
    const premioDoc = doc(this._rutaPremiosTrivia, premioId);
    return from(getDoc(premioDoc)).pipe(map((doc) => (doc.exists() ? doc.data() as PremioTrivia : undefined)));
  }



}
