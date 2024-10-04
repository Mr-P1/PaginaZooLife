import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, signOut, UserCredential, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface User {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private _auth = inject(Auth);

  // Observable para obtener el estado de autenticación actual
  get authState$(): Observable<any> {
    return authState(this._auth);
  }

  // Método para cerrar sesión
  logOut() {
    return signOut(this._auth);
  }

  // Método para iniciar sesión con email y password
  logearse(user: User) {
    return signInWithEmailAndPassword(this._auth, user.email, user.password);
  }

  // Método para registrar un nuevo usuario
  registrarUsuario(user: User): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this._auth, user.email, user.password);
  }

  // Método para obtener el usuario autenticado actualmente
  async getCurrentUser(): Promise<any> {
    const currentUser = this._auth.currentUser;
    if (!currentUser) {
      throw new Error('No hay un usuario autenticado actualmente');
    }
    return currentUser;
  }
}
