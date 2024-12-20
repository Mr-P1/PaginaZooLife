import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, addDoc, collectionData, doc, getDoc, updateDoc
  , deleteDoc, getDocs, query, orderBy, limit, startAfter, startAt, where
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { PremioTrivia } from './premios.service'

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  nivel: number;
  puntos: number;
  patente: string;
  auth_id: string;
  token?:string;
}

export interface PremioUsuario {
  id: string;
  codigo: string,
  estado: boolean,
  premioId: string,
  usuarioId: string,
}

// Lo siguiente es para omitir el id porque se creará al añadir el usuario
export type CrearUsuario = Omit<Usuario, 'id'>;

const PATH_Usuarios = 'Usuarios';
const PATH_PremiosUsuarios = 'PremiosUsuarios';
const PATH_PremiosTrivia = 'Premios_trivia'
const PATH_RespuestasTrivia = 'RespuestasTrivia'
const PATH_Boletas_usadas = 'Boletas_usadas';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private _firestore = inject(Firestore);
  private _rutaUsuarios = collection(this._firestore, PATH_Usuarios);
  private _rutaPremiosUsuarios = collection(this._firestore, PATH_PremiosUsuarios);
  private _rutaPremiosTrivia = collection(this._firestore, PATH_PremiosTrivia);
  private _rutaRespuestasTrivia = collection(this._firestore, PATH_RespuestasTrivia);
  private boletasUsadasRef = collection(this._firestore, PATH_Boletas_usadas);

  // Crear un nuevo usuario
  async crearUsuario(usuario: CrearUsuario) {
    return addDoc(this._rutaUsuarios, usuario);
  }
 // Obtener usuarios paginados
 async getUsuariosPaginados(pageSize: number, lastVisibleDoc: any = null): Promise<{ usuarios: Usuario[], lastVisible: any, firstVisible: any }> {
  let q;
  if (lastVisibleDoc) {
    q = query(this._rutaUsuarios, orderBy('nombre'), startAfter(lastVisibleDoc), limit(pageSize));
  } else {
    q = query(this._rutaUsuarios, orderBy('nombre'), limit(pageSize));
  }

  const snapshot = await getDocs(q);
  const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Usuario[];
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];
  const firstVisible = snapshot.docs[0];

  return { usuarios, lastVisible, firstVisible };
}

// Obtener la página anterior de usuarios
async getUsuariosPaginadosAnterior(pageSize: number, firstVisibleDoc: any): Promise<{ usuarios: Usuario[], lastVisible: any, firstVisible: any }> {
  const q = query(this._rutaUsuarios, orderBy('nombre'), startAt(firstVisibleDoc), limit(pageSize));

  const snapshot = await getDocs(q);
  const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Usuario[];
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];
  const firstVisible = snapshot.docs[0];

  return { usuarios, lastVisible, firstVisible };
}
  // Buscar usuarios por término
  async buscarUsuarios(term: string): Promise<Usuario[]> {
    // Crear consultas por nombre, correo, teléfono y patente
    const q1 = query(
      this._rutaUsuarios,
      where('nombre', '>=', term),
      where('nombre', '<=', term + '\uf8ff')
    );

    const q2 = query(
      this._rutaUsuarios,
      where('correo', '>=', term),
      where('correo', '<=', term + '\uf8ff')
    );

    const q3 = query(
      this._rutaUsuarios,
      where('telefono', '>=', term),
      where('telefono', '<=', term + '\uf8ff')
    );

    const q4 = query(
      this._rutaUsuarios,
      where('patente', '>=', term),
      where('patente', '<=', term + '\uf8ff')
    );

    // Ejecutar todas las consultas en paralelo
    const [snapshot1, snapshot2, snapshot3, snapshot4] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
      getDocs(q3),
      getDocs(q4),
    ]);

    // Obtener los resultados de las consultas
    const usuarios1 = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as Usuario));
    const usuarios2 = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as Usuario));
    const usuarios3 = snapshot3.docs.map(doc => ({ id: doc.id, ...doc.data() } as Usuario));
    const usuarios4 = snapshot4.docs.map(doc => ({ id: doc.id, ...doc.data() } as Usuario));

    // Unir todos los resultados y eliminar duplicados por ID
    const allUsuarios = [...usuarios1, ...usuarios2, ...usuarios3, ...usuarios4];
    const uniqueUsuarios = Array.from(new Set(allUsuarios.map(u => u.id)))
      .map(id => allUsuarios.find(u => u.id === id)!);

    return uniqueUsuarios;
  }


  getUsuario2(id: string): Observable<Usuario | null> {
    const premiosQuery = query(this._rutaUsuarios, where('auth_id', '==', id));
    return collectionData(premiosQuery, { idField: 'id' }).pipe(
      map((usuarios: Usuario[]) => usuarios.length > 0 ? usuarios[0] : null)
    );
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

  // Editar un usuario
  async editarUsuario(id: string, usuario: CrearUsuario) {
    const document = doc(this._rutaUsuarios, id);
    return updateDoc(document, usuario);
  }

  // Eliminar un usuario
  async eliminarUsuario(id: string): Promise<void> {
    const usuarioDoc = doc(this._rutaUsuarios, id);
    const usuarioSnapshot = await getDoc(usuarioDoc);

    if (usuarioSnapshot.exists()) {
      await deleteDoc(usuarioDoc);
    } else {
      throw new Error('Usuario no encontrado');
    }
  }

  // Obtener todos los usuarios
  getUsuarios(): Observable<Usuario[]> {
    return collectionData(this._rutaUsuarios, { idField: 'id' }) as Observable<Usuario[]>;
  }


  //Respuestas del usuario
  getRespuestasPorUsuario(userId: string): Observable<{ correctas: number, incorrectas: number , total:number}> {
    const respuestasQuery = query(this._rutaRespuestasTrivia, where('user_id', '==', userId));

    return collectionData(respuestasQuery, { idField: 'id' }).pipe(
      map((respuestas: any[]) => {
        // Contar las respuestas correctas e incorrectas
        const correctas = respuestas.filter(respuesta => respuesta.resultado === true).length;
        const incorrectas = respuestas.filter(respuesta => respuesta.resultado === false).length;
        const total = correctas + incorrectas ;
        return { correctas, incorrectas,total };
      })
    );
  }


  async getBoletasUsadasPorUsuario(): Promise<{ [key: string]: number }> {
    const snapshot = await getDocs(this.boletasUsadasRef);
    const boletasPorUsuario: { [key: string]: number } = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const userId = data['id_usuario']; // Asegúrate de que el campo sea 'user_id' o ajústalo según corresponda.
      if (userId) {
        boletasPorUsuario[userId] = (boletasPorUsuario[userId] || 0) + 1;
      }
    });

    return boletasPorUsuario;
  }



    // Nueva función para obtener los tokens de todos los usuarios
    obtenerTokensDeUsuarios(): Observable<string[]> {
      return from(getDocs(this._rutaUsuarios)).pipe(
        map((querySnapshot) => {
          const tokens: string[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as Usuario;
            if (data.token) { // Asegurarse de que el token exista
              tokens.push(data.token);
            }
          });
          return tokens;
        })
      );
    }



}
