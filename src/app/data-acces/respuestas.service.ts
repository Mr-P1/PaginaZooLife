import { Injectable, inject } from '@angular/core';
import { es } from 'date-fns/locale';
import { Firestore, collection, query, where, getDocs, collectionData } from '@angular/fire/firestore';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';


export interface TriviaResponse {
  abandonada: boolean; // Indica si la trivia fue abandonada
  fecha: Timestamp; // Fecha y hora de la respuesta
  genero_usuario: string; // Género del usuario que respondió
  pregunta_id: string; // ID de la pregunta asociada
  resultado: boolean; // Resultado de la respuesta (true si fue correcta)
  tiempoRespuesta: number; // Tiempo tomado para responder en segundos
  tipo: string; // Tipo de usuario (niño, adulto, etc.)
  user_id: string; // ID del usuario que respondió
}



const PATH_RespuestasTrivia = 'RespuestasTrivia';

@Injectable({
  providedIn: 'root',
})
export class RespuestasService {

  private _firestore = inject(Firestore);
  private _rutaRespuestasTrivia = collection(this._firestore, PATH_RespuestasTrivia);


  // Método para obtener todas las respuestas de trivia, incluyendo el tiempo promedio y la tasa de abandono
  getRespuestasTrivia(): Observable<{ total: number, correctas: number, incorrectas: number, tiempoPromedio: number, tasaAbandono: number }> {
    const respuestasQuery = query(this._rutaRespuestasTrivia);
    return collectionData(respuestasQuery, { idField: 'id' }).pipe(
      map((respuestas: any[]) => {
        const correctas = respuestas.filter(respuesta => respuesta.resultado === true).length;
        const incorrectas = respuestas.filter(respuesta => respuesta.resultado === false).length;
        const total = respuestas.length;

        // Calcular tiempo promedio
        const tiempoTotal = respuestas.reduce((sum, respuesta) => sum + (respuesta.tiempoRespuesta || 0), 0);
        const tiempoPromedio = total > 0 ? tiempoTotal / total : 0;

        // Calcular tasa de abandono
        const abandonadas = respuestas.filter(respuesta => respuesta.abandonada === true).length;
        const tasaAbandono = total > 0 ? (abandonadas / total) * 100 : 0;

        return { total, correctas, incorrectas, tiempoPromedio, tasaAbandono };
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


  obtenerRespuestasTriviaPorAno(anio: number): Observable<{ labels: string[]; correctas: number[]; incorrectas: number[] }> {
    const inicioAno = Timestamp.fromDate(new Date(anio, 0, 1)); // 1 de Enero del año especificado
    const finAno = Timestamp.fromDate(new Date(anio, 11, 31, 23, 59, 59)); // 31 de Diciembre del mismo año

    const anoQuery = query(
      this._rutaRespuestasTrivia,
      where('fecha', '>=', inicioAno),
      where('fecha', '<=', finAno)
    );

    return from(getDocs(anoQuery)).pipe(
      map(snapshot => {
        const meses = Array(12).fill(0); // Índices para 12 meses
        const correctas = [...meses];
        const incorrectas = [...meses];

        snapshot.forEach(doc => {
          const respuesta = doc.data() as TriviaResponse;
          const mes = (respuesta.fecha as Timestamp).toDate().getMonth(); // Obtener el mes (0-indexed)

          if (respuesta.resultado) {
            correctas[mes]++;
          } else {
            incorrectas[mes]++;
          }
        });

        const labels = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        return { labels, correctas, incorrectas };
      })
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


  getRespuestasPorTipoYResultado(): Observable<{
    adultoCorrectas: number;
    adultoIncorrectas: number;
    ninoCorrectas: number;
    ninoIncorrectas: number;
  }> {
    const respuestasQuery = query(this._rutaRespuestasTrivia);
    return collectionData(respuestasQuery, { idField: 'id' }).pipe(
      map((respuestas: any[]) => {
        const adultoCorrectas = respuestas.filter(
          (r) => r.tipo === 'adulto' && r.resultado === true
        ).length;
        const adultoIncorrectas = respuestas.filter(
          (r) => r.tipo === 'adulto' && r.resultado === false
        ).length;
        const ninoCorrectas = respuestas.filter(
          (r) => r.tipo === 'niño' && r.resultado === true
        ).length;
        const ninoIncorrectas = respuestas.filter(
          (r) => r.tipo === 'niño' && r.resultado === false
        ).length;

        return { adultoCorrectas, adultoIncorrectas, ninoCorrectas, ninoIncorrectas };
      })
    );
  }


  getRespuestasPorGenero(): Observable<{ masculino: number; femenino: number; sinDefinir: number }> {
    const respuestasQuery = query(this._rutaRespuestasTrivia);
    return collectionData(respuestasQuery, { idField: 'id' }).pipe(
      map((respuestas: any[]) => {
        const masculino = respuestas.filter(r => r.genero_usuario === 'masculino').length;
        const femenino = respuestas.filter(r => r.genero_usuario === 'femenino').length;
        const sinDefinir = respuestas.filter(r => !r.genero_usuario || r.genero_usuario === 'Sin definir').length;

        return { masculino, femenino, sinDefinir };
      })
    );
  }


  // Obtener respuestas trivia por día (hoy) con correctas e incorrectas
obtenerRespuestasCorrectasIncorrectasPorDia(): Observable<{ labels: string[], correctas: number[], incorrectas: number[] }> {
  const hoy = new Date();
  const inicioDia = startOfDay(hoy).toISOString();
  const finDia = endOfDay(hoy).toISOString();

  const diaQuery = query(
    this._rutaRespuestasTrivia,
    where('fecha', '>=', Timestamp.fromDate(new Date(inicioDia))),
    where('fecha', '<=', Timestamp.fromDate(new Date(finDia)))
  );

  return from(getDocs(diaQuery)).pipe(
    map(snapshot => this.mapDataToCorrectasIncorrectas(snapshot.docs, 24, 'hora'))
  );
}

// Obtener respuestas trivia por semana con correctas e incorrectas
obtenerRespuestasCorrectasIncorrectasPorSemana(): Observable<{ labels: string[], correctas: number[], incorrectas: number[] }> {
  const hoy = new Date();
  const inicioSemana = startOfWeek(hoy, { locale: es }).toISOString();
  const finSemana = endOfWeek(hoy, { locale: es }).toISOString();

  const semanaQuery = query(
    this._rutaRespuestasTrivia,
    where('fecha', '>=', Timestamp.fromDate(new Date(inicioSemana))),
    where('fecha', '<=', Timestamp.fromDate(new Date(finSemana)))
  );

  return from(getDocs(semanaQuery)).pipe(
    map(snapshot => this.mapDataToCorrectasIncorrectas(snapshot.docs, 7, 'semana'))
  );
}

// Mapeo de datos para correctas e incorrectas
private mapDataToCorrectasIncorrectas(docs: any[], size: number, type: 'hora' | 'semana'): { labels: string[], correctas: number[], incorrectas: number[] } {
  const correctas = new Array(size).fill(0);
  const incorrectas = new Array(size).fill(0);

  docs.forEach(doc => {
    const data = doc.data();
    const fecha = (data.fecha as Timestamp).toDate();
    let index = -1; // Inicializamos con un valor predeterminado

    if (type === 'hora') {
      index = fecha.getHours();
    } else if (type === 'semana') {
      const dia = fecha.getDay();
      index = dia === 0 ? 6 : dia - 1; // Ajustar domingo al final
    }

    // Asegurarnos de que el índice esté dentro del rango esperado
    if (index >= 0 && index < size) {
      if (data.resultado) {
        correctas[index]++;
      } else {
        incorrectas[index]++;
      }
    }
  });

  const labels = type === 'hora'
    ? Array.from({ length: size }, (_, i) => `${i}:00`)
    : ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return { labels, correctas, incorrectas };
}


obtenerRespuestasTriviaPorAnoYTipoUsuario(anio: number): Observable<{
  labels: string[];
  adultoCorrectas: number[];
  adultoIncorrectas: number[];
  ninoCorrectas: number[];
  ninoIncorrectas: number[];
}> {
  const inicioAno = Timestamp.fromDate(new Date(anio, 0, 1));
  const finAno = Timestamp.fromDate(new Date(anio, 11, 31, 23, 59, 59));

  const anoQuery = query(
    this._rutaRespuestasTrivia,
    where('fecha', '>=', inicioAno),
    where('fecha', '<=', finAno)
  );

  return from(getDocs(anoQuery)).pipe(
    map(snapshot => {
      const meses = Array(12).fill(0); // Índices para 12 meses
      const adultoCorrectas = [...meses];
      const adultoIncorrectas = [...meses];
      const ninoCorrectas = [...meses];
      const ninoIncorrectas = [...meses];

      snapshot.forEach(doc => {
        const respuesta = doc.data() as TriviaResponse;
        const mes = (respuesta.fecha as Timestamp).toDate().getMonth(); // Obtener el mes (0-indexed)

        if (respuesta.tipo === 'adulto') {
          if (respuesta.resultado) {
            adultoCorrectas[mes]++;
          } else {
            adultoIncorrectas[mes]++;
          }
        } else if (respuesta.tipo === 'niño') {
          if (respuesta.resultado) {
            ninoCorrectas[mes]++;
          } else {
            ninoIncorrectas[mes]++;
          }
        }
      });

      const labels = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      return { labels, adultoCorrectas, adultoIncorrectas, ninoCorrectas, ninoIncorrectas };
    })
  );
}




}
