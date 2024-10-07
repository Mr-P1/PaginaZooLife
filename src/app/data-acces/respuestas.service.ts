import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const PATH_RespuestasTrivia = 'RespuestasTrivia';

@Injectable({
  providedIn: 'root',
})
export class RespuestasService {

  private _firestore = inject(Firestore);
  private _rutaRespuestasTrivia = collection(this._firestore, PATH_RespuestasTrivia);

  // Método para obtener todas las respuestas de trivia
  getRespuestasTrivia(): Observable<{ total: number, correctas: number, incorrectas: number }> {
    const respuestasQuery = query(this._rutaRespuestasTrivia);
    return collectionData(respuestasQuery, { idField: 'id' }).pipe(
      map((respuestas: any[]) => {
        const correctas = respuestas.filter(respuesta => respuesta.resultado === true).length;
        const incorrectas = respuestas.filter(respuesta => respuesta.resultado === false).length;
        const total = respuestas.length;
        return { total, correctas, incorrectas };
      })
    );
  }
}
