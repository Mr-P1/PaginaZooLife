import { Injectable, inject } from '@angular/core';
import { es } from 'date-fns/locale';
import { Firestore, collection, query, where, getDocs, collectionData } from '@angular/fire/firestore';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';

const PATH_RespuestasTrivia = 'RespuestasTrivia';

@Injectable({
  providedIn: 'root',
})
export class RespuestasService {

  private _firestore = inject(Firestore);
  private _rutaRespuestasTrivia = collection(this._firestore, PATH_RespuestasTrivia);
  private respuestasTriviaRef = collection(this._firestore, PATH_RespuestasTrivia);

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

  // Obtener respuestas trivia por día (hoy)
  obtenerRespuestasPorDia(): Observable<any> {
    const hoy = new Date();
    const inicioDia = startOfDay(hoy).toISOString();
    const finDia = endOfDay(hoy).toISOString();

    const diaQuery = query(this._rutaRespuestasTrivia, where('fecha', '>=', Timestamp.fromDate(new Date(inicioDia))), where('fecha', '<=', Timestamp.fromDate(new Date(finDia))));

    return from(getDocs(diaQuery)).pipe(
      map(snapshot => this.mapDataToHours(snapshot.docs))
    );
  }

  private mapDataToHours(docs: any[]): any {
    const data = new Array(24).fill(0);
    docs.forEach(doc => {
      const fecha = (doc.data().fecha as Timestamp).toDate(); // Convertir el timestamp de Firebase a Date
      const hora = fecha.getHours();
      data[hora]++;
    });
    return { labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), data };
  }

  // Obtener respuestas trivia por semana
  obtenerRespuestasPorSemana(): Observable<any> {
    const hoy = new Date();
    const inicioSemana = startOfWeek(hoy, { locale: es }).toISOString();
    const finSemana = endOfWeek(hoy, { locale: es }).toISOString();

    const semanaQuery = query(this._rutaRespuestasTrivia, where('fecha', '>=', Timestamp.fromDate(new Date(inicioSemana))), where('fecha', '<=', Timestamp.fromDate(new Date(finSemana))));

    return from(getDocs(semanaQuery)).pipe(
      map(snapshot => this.mapDataToWeekDays(snapshot.docs))
    );
  }

  private mapDataToWeekDays(docs: any[]): any {
    const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const data = new Array(7).fill(0);
    docs.forEach(doc => {
      const fecha = (doc.data().fecha as Timestamp).toDate(); // Convertir el timestamp de Firebase a Date
      const dia = fecha.getDay(); // Devuelve un número de 0 (domingo) a 6 (sábado)
      data[(dia === 0 ? 6 : dia - 1)]++; // Mapeamos domingo (0) al final (6) y ajustamos los demás
    });
    return { labels: diasSemana, data };
  }

  // Obtener respuestas trivia por año
  obtenerRespuestasPorAno(): Observable<any> {
    const hoy = new Date();
    const inicioAno = startOfYear(hoy).toISOString();
    const finAno = endOfYear(hoy).toISOString();

    const anoQuery = query(this._rutaRespuestasTrivia, where('fecha', '>=', Timestamp.fromDate(new Date(inicioAno))), where('fecha', '<=', Timestamp.fromDate(new Date(finAno))));

    return from(getDocs(anoQuery)).pipe(
      map(snapshot => this.mapDataToMonths(snapshot.docs))
    );
  }

  private mapDataToMonths(docs: any[]): any {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const data = new Array(12).fill(0);
    docs.forEach(doc => {
      const fecha = (doc.data().fecha as Timestamp).toDate(); // Convertir el timestamp de Firebase a Date
      const mes = fecha.getMonth();
      data[mes]++;
    });
    return { labels: meses, data };
  }
}
