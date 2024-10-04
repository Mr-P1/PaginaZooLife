import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, getDoc, updateDoc
  , deleteDoc, getDocs, query, orderBy, limit, startAfter, startAt, where } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  nivel: number;
  puntos: number;
 patente: string ;
}

// Lo siguiente es para omitir el id porque se creará al añadir el usuario
export type CrearUsuario = Omit<Usuario, 'id'>;

const PATH_Usuarios = 'Usuarios';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private _firestore = inject(Firestore);
  private _rutaUsuarios = collection(this._firestore, PATH_Usuarios);

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


  // Obtener un usuario específico por su ID
  getUsuario(id: string): Observable<Usuario | null> {
    const docRef = doc(this._rutaUsuarios, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as Usuario : null)
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
}
