import { Injectable, inject } from '@angular/core';
import { collection, Firestore, collectionData, where, query } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';

export interface ResultadoTrivia {
  id:String;
  completada: boolean;            // Indica si la trivia ha sido completada
  fecha: string;                  // Fecha en formato string
  nivelGanado: number;            // Nivel ganado en la trivia
  puntosGanados: number;          // Puntos obtenidos en la trivia
  respuestasCorrectas: number;    // Cantidad de respuestas correctas
  triviaRealizada: boolean;       // Indica si la trivia fue realizada
  userId: string;                 // ID del usuario que realizó la trivia
}




const PATH_TriviasVisita = 'TriviaVisitas';




@Injectable({
  providedIn: 'root'
})
export class TriviaRealizadaService {
  constructor(private http: HttpClient) { }

  private _firestore = inject(Firestore);
  private _rutaRatings = collection(this._firestore, PATH_TriviasVisita);


    // Método para obtener las trivias realizadas esta semana
    getTriviasEstaSemana(): Observable<any> {
      // Obtener fecha de inicio y fin de la semana actual
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Inicio de la semana
      const endOfWeek = new Date(today.setDate(today.getDate() + (6 - today.getDay()))); // Fin de la semana

      // Convertir a Timestamps para realizar la consulta
      const startTimestamp = Timestamp.fromDate(startOfWeek);
      const endTimestamp = Timestamp.fromDate(endOfWeek);

      // Crear la consulta para obtener trivias realizadas esta semana
      const q = query(
        this._rutaRatings,
        where('fecha', '>=', startTimestamp),
        where('fecha', '<=', endTimestamp)
      );

      // Obtener los datos
      return collectionData(q, { idField: 'id' }).pipe(
        map((trivias: ResultadoTrivia[]) => {
          // Contar las trivias completadas, no completadas y no realizadas
          let completadas = 0;
          let noCompletadas = 0;
          let noRealizadas = 0;

          trivias.forEach(trivia => {
            if (trivia.triviaRealizada) {
              if (trivia.completada) {
                completadas++;
              } else {
                noCompletadas++;
              }
            } else {
              noRealizadas++;
            }
          });

          return {
            triviasRealizadas: completadas + noCompletadas,
            completadas: completadas,
            noCompletadas: noCompletadas,
            noRealizadas: noRealizadas
          };
        })
      );
    }



}
