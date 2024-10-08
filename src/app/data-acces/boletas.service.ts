import { es } from 'date-fns/locale';
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs, onSnapshot } from '@angular/fire/firestore';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Observable, forkJoin, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface Usuario {
  auth_id: string;
  correo: string;
  nivel: number;
  nombre: string;
  puntos: number;
  telefono: string;
  tipo: string;
}
interface BoletaUsada {
  fecha: string;
  id_usuario: string;
  tipo: string;
}

const PATH_Boletas_usadas = 'Boletas_usadas';
const PATH_Usuarios = 'Usuarios';

@Injectable({
  providedIn: 'root'
})
export class BoletasService {
  private _firestore = inject(Firestore);
  private boletasUsadasRef = collection(this._firestore, PATH_Boletas_usadas);
  private _rutaUsuarios = collection(this._firestore, PATH_Usuarios);


  obtenerVisitantesHoy(): Observable<number> {
    const hoy = new Date().toISOString(); // Usar la fecha en formato ISO
    const inicioDia = hoy.slice(0, 10) + 'T00:00:00.000Z'; // Inicio del día en formato ISO
    const finDia = hoy.slice(0, 10) + 'T23:59:59.999Z'; // Fin del día en formato ISO

    const visitantesQuery = query(
      this.boletasUsadasRef,
      where('fecha', '>=', inicioDia),
      where('fecha', '<=', finDia)
    );

    // Usamos onSnapshot para escuchar los cambios en tiempo real
    return new Observable<number>((observer) => {
      const unsubscribe = onSnapshot(visitantesQuery, (snapshot) => {
        console.log(`Visitantes hoy: ${snapshot.size}`); // Verificar cuántos visitantes hay
        observer.next(snapshot.size);  // Emitimos el número de visitantes
      }, (error) => {
        observer.error(error);  // Manejo de errores
      });

      // Cleanup al dejar de escuchar
      return () => unsubscribe();
    });
  }


  obtenerBoletasPorDia(): Observable<any> {
    const hoy = new Date();
    const inicioDia = startOfDay(hoy).toISOString();
    const finDia = endOfDay(hoy).toISOString();

    const diaQuery = query(this.boletasUsadasRef, where('fecha', '>=', inicioDia), where('fecha', '<=', finDia));

    return from(getDocs(diaQuery)).pipe(
      map(snapshot => this.mapDataToHours(snapshot.docs))
    );
  }

  obtenerBoletasPorSemana(): Observable<any> {
    const hoy = new Date();
    const inicioSemana = startOfWeek(hoy, { locale: es }).toISOString();
    const finSemana = endOfWeek(hoy, { locale: es }).toISOString();

    const semanaQuery = query(this.boletasUsadasRef, where('fecha', '>=', inicioSemana), where('fecha', '<=', finSemana));

    return from(getDocs(semanaQuery)).pipe(
      map(snapshot => this.mapDataToWeekDays(snapshot.docs))
    );
  }

  obtenerBoletasPorAno(): Observable<any> {
    const hoy = new Date();
    const inicioAno = startOfYear(hoy).toISOString();
    const finAno = endOfYear(hoy).toISOString();

    const anoQuery = query(this.boletasUsadasRef, where('fecha', '>=', inicioAno), where('fecha', '<=', finAno));

    return from(getDocs(anoQuery)).pipe(
      map(snapshot => this.mapDataToMonths(snapshot.docs))
    );
  }

  // Métodos para mapear los datos en horas, días de la semana y meses.
  private mapDataToHours(docs: any[]): any {
    const data = new Array(24).fill(0);
    docs.forEach(doc => {
      const fecha = new Date(doc.data().fecha);
      const hora = fecha.getHours();
      data[hora]++;
    });
    return { labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), data };
  }

  private mapDataToWeekDays(docs: any[]): any {
    const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const data = new Array(7).fill(0);
    docs.forEach(doc => {
      const fecha = new Date(doc.data().fecha);
      const dia = fecha.getDay();  // Devuelve un número de 0 (domingo) a 6 (sábado)
      data[(dia === 0 ? 6 : dia - 1)]++;  // Mapeamos domingo (0) al final (6) y ajustamos los demás
    });
    return { labels: diasSemana, data };
  }

  private mapDataToMonths(docs: any[]): any {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const data = new Array(12).fill(0);
    docs.forEach(doc => {
      const fecha = new Date(doc.data().fecha);
      const mes = fecha.getMonth();
      data[mes]++;
    });
    return { labels: meses, data };
  }



  // Este método devuelve usuarios con la cantidad de boletas usadas y la última visita
  obtenerUsuariosConBoletas(): Observable<any[]> {
    return from(getDocs(this.boletasUsadasRef)).pipe(
      map(snapshot => {
        const boletasPorUsuario: { [key: string]: { count: number; lastDate: string } } = {};

        snapshot.forEach(doc => {
          const boleta = doc.data() as BoletaUsada;
          const usuarioId = boleta.id_usuario;

          // Si es la primera vez que vemos este usuario
          if (!boletasPorUsuario[usuarioId]) {
            boletasPorUsuario[usuarioId] = { count: 1, lastDate: boleta.fecha };
          } else {
            boletasPorUsuario[usuarioId].count++;
            // Actualizar la última visita si es más reciente
            if (new Date(boleta.fecha) > new Date(boletasPorUsuario[usuarioId].lastDate)) {
              boletasPorUsuario[usuarioId].lastDate = boleta.fecha;
            }
          }
        });

        return boletasPorUsuario;
      }),
      switchMap(boletasPorUsuario => {
        // Consulta los usuarios relacionados con las boletas usadas
        const usuariosObservables = Object.keys(boletasPorUsuario).map(userId =>
          from(getDocs(query(this._rutaUsuarios, where('auth_id', '==', userId)))).pipe(
            map(userSnapshot => {
              if (userSnapshot.docs.length > 0) {
                const usuario = userSnapshot.docs[0].data() as Usuario;
                return {
                  ...usuario,
                  boletasUsadas: boletasPorUsuario[userId].count,
                  ultimaVisita: boletasPorUsuario[userId].lastDate
                };
              } else {
                return null; // En caso de que no encuentre el usuario (esto no debería ocurrir)
              }
            })
          )
        );
        return forkJoin(usuariosObservables).pipe(
          map(usuarios => usuarios.filter(u => u !== null)) // Filtra los valores nulos
        );
      })
    );
  }
















}



