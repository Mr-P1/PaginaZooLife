import { es } from 'date-fns/locale';
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs, onSnapshot, Timestamp,addDoc, setDoc, doc } from '@angular/fire/firestore';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Observable, forkJoin, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';



export interface Usuario {
  auth_id: string;              // Identificador único de autenticación
  comuna: string;               // Comuna de residencia del usuario
  correo: string;               // Correo electrónico del usuario
  fechaNacimiento: Timestamp;   // Fecha de nacimiento del usuario (tipo timestamp)
  fechaRegistro?: Timestamp;     // Fecha de registro en el sistema (tipo timestamp)
  genero: string;               // Género del usuario ("Sin definir" como ejemplo)
  nivel: number;                // Nivel del usuario (puede representar experiencia o categoría)
  nombre: string;               // Nombre completo del usuario
  patente: string;              // Patente (puede estar vacío si no aplica)
  puntos: number;               // Puntos acumulados por el usuario
  region: string;               // Región de residencia del usuario
  telefono: string;             // Número de teléfono del usuario
}


interface BoletaUsada {
  fecha: string | Timestamp;
  id_usuario: string;
  tipo: string;
}

interface Boleta{
  id:string,
  tipo:string,
}

const PATH_Boletas_usadas = 'Boletas_usadas';
const PATH_Usuarios = 'Usuarios';
const PATH_Boletas = 'Boletas';

@Injectable({
  providedIn: 'root'
})
export class BoletasService {
  private _firestore = inject(Firestore);
  private boletasUsadasRef = collection(this._firestore, PATH_Boletas_usadas);
  private _rutaUsuarios = collection(this._firestore, PATH_Usuarios);
  private _rutaBoletas = collection(this._firestore, PATH_Boletas);


  private functionUrl = 'https://us-central1-appzoolife.cloudfunctions.net/calcularVisitasPorPeriodo';

  constructor(private http: HttpClient) {}


  obtenerVisitantesHoy(): Observable<number> {
    // Obtener la fecha de hoy a las 00:00 y 23:59 en formato Timestamp
    const inicioHoy = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));
    const finHoy = Timestamp.fromDate(new Date(new Date().setHours(23, 59, 59, 999)));

    const visitantesQuery = query(
      this.boletasUsadasRef,
      where('fecha', '>=', inicioHoy),
      where('fecha', '<=', finHoy)
    );

    // Usamos onSnapshot para escuchar los cambios en tiempo real
    return new Observable<number>((observer) => {
      const unsubscribe = onSnapshot(visitantesQuery, (snapshot) => {
        observer.next(snapshot.size);  // Emitimos el número de visitantes
      }, (error) => {
        observer.error(error);  // Manejo de errores
      });

      // Cleanup al dejar de escuchar
      return () => unsubscribe();
    });
  }

  obtenerVisitantesHoy2(): Observable<number> {
    const hoy = new Date();
    const inicioDia = Timestamp.fromDate(startOfDay(hoy));  // Convertir a Timestamp de Firebase
    const finDia = Timestamp.fromDate(endOfDay(hoy));

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



 // Boletas por día
obtenerBoletasPorDia(): Observable<any> {
  const hoy = new Date();
  const inicioDia = Timestamp.fromDate(startOfDay(hoy));
  const finDia = Timestamp.fromDate(endOfDay(hoy));

  const diaQuery = query(this.boletasUsadasRef, where('fecha', '>=', inicioDia), where('fecha', '<=', finDia));

  return from(getDocs(diaQuery)).pipe(
    map(snapshot => this.mapDataToHours(snapshot.docs))
  );
}

// Boletas por semana
obtenerBoletasPorSemana(): Observable<any> {
  const hoy = new Date();
  const inicioSemana = Timestamp.fromDate(startOfWeek(hoy, { locale: es }));
  const finSemana = Timestamp.fromDate(endOfWeek(hoy, { locale: es }));

  const semanaQuery = query(this.boletasUsadasRef, where('fecha', '>=', inicioSemana), where('fecha', '<=', finSemana));

  return from(getDocs(semanaQuery)).pipe(
    map(snapshot => this.mapDataToWeekDays(snapshot.docs))
  );
}

obtenerBoletasPorAno(anio: number): Observable<any> {
  const inicioAno = Timestamp.fromDate(new Date(anio, 0, 1)); // 1 de Enero del año especificado
  const finAno = Timestamp.fromDate(new Date(anio, 11, 31, 23, 59, 59)); // 31 de Diciembre del mismo año

  const anoQuery = query(
    this.boletasUsadasRef,
    where('fecha', '>=', inicioAno),
    where('fecha', '<=', finAno)
  );

  return from(getDocs(anoQuery)).pipe(
    map(snapshot => this.mapDataToMonths(snapshot.docs))
  );
}


// Métodos de mapeo

private mapDataToHours(docs: any[]): any {
  const data = new Array(24).fill(0);
  docs.forEach(doc => {
    const fecha = doc.data().fecha.toDate();  // Convertimos el Timestamp a Date
    const hora = fecha.getHours();
    data[hora]++;
  });
  return { labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), data };
}

private mapDataToWeekDays(docs: any[]): any {
  const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const data = new Array(7).fill(0);
  docs.forEach(doc => {
    const fecha = doc.data().fecha.toDate();  // Convertimos el Timestamp a Date
    const dia = fecha.getDay();
    data[(dia === 0 ? 6 : dia - 1)]++;  // Mapeamos domingo (0) al final (6) y ajustamos los demás
  });
  return { labels: diasSemana, data };
}

private mapDataToMonths(docs: any[]): any {
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const data = new Array(12).fill(0);
  docs.forEach(doc => {
    const fecha = doc.data().fecha.toDate();  // Convertimos el Timestamp a Date
    const mes = fecha.getMonth();
    data[mes]++;
  });
  return { labels: meses, data };
}



 // Este método devuelve usuarios con la cantidad de boletas usadas y la última visita
obtenerUsuariosConBoletas(): Observable<any[]> {
  return from(getDocs(this.boletasUsadasRef)).pipe(
    map(snapshot => {
      const boletasPorUsuario: { [key: string]: { count: number; lastDate: Timestamp } } = {};

      snapshot.forEach(doc => {
        const boleta = doc.data() as BoletaUsada;
        const usuarioId = boleta.id_usuario;
        const fechaBoleta = boleta.fecha as Timestamp; // Asumimos que 'fecha' es un Timestamp

        // Si es la primera vez que vemos este usuario
        if (!boletasPorUsuario[usuarioId]) {
          boletasPorUsuario[usuarioId] = { count: 1, lastDate: fechaBoleta };
        } else {
          boletasPorUsuario[usuarioId].count++;
          // Actualizar la última visita si es más reciente
          if (fechaBoleta.toDate() > boletasPorUsuario[usuarioId].lastDate.toDate()) {
            boletasPorUsuario[usuarioId].lastDate = fechaBoleta;
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
                ultimaVisita: boletasPorUsuario[userId].lastDate.toDate() // Convertimos el Timestamp a Date para la visualización
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


obtenerBoletasPorUsuario(usuarioId: string): Observable<any> {
  const boletasQuery = query(this.boletasUsadasRef, where('id_usuario', '==', usuarioId));

  return from(getDocs(boletasQuery)).pipe(
    map(snapshot => {
      const boletasPorUsuario: { count: number; lastDate: Timestamp | null } = {
        count: 0,
        lastDate: null,
      };

      snapshot.forEach(doc => {
        const boleta = doc.data() as BoletaUsada;
        const fechaBoleta = boleta.fecha as Timestamp;

        boletasPorUsuario.count++;

        if (!boletasPorUsuario.lastDate || fechaBoleta.toDate() > boletasPorUsuario.lastDate.toDate()) {
          boletasPorUsuario.lastDate = fechaBoleta;
        }
      });

      return boletasPorUsuario;
    }),
    switchMap(boletasInfo => {
      const usuarioQuery = query(this._rutaUsuarios, where('auth_id', '==', usuarioId));

      return from(getDocs(usuarioQuery)).pipe(
        map(userSnapshot => {
          if (userSnapshot.docs.length > 0) {
            const usuario = userSnapshot.docs[0].data() as Usuario;
            return {
              ...usuario,
              boletasUsadas: boletasInfo.count,
              ultimaVisita: boletasInfo.lastDate ? boletasInfo.lastDate.toDate() : null,
            };
          } else {
            console.warn(`Usuario con ID ${usuarioId} no encontrado.`);
            return null;
          }
        })
      );
    })
  );
}


async guardarBoleta(boleta: Boleta): Promise<void> {
  try {
    // Crea una referencia a un documento específico con el ID de la boleta
    const docRef = doc(this._rutaBoletas, boleta.id);

    // Usa setDoc para guardar los datos en ese documento con el ID especificado
    await setDoc(docRef, {
      tipo: boleta.tipo,
      fecha: Timestamp.fromDate(new Date())
    });

    console.log('Boleta guardada con éxito');
  } catch (error) {
    console.error('Error al guardar la boleta:', error);
  }
}


obtenerUsuarios(): Observable<Usuario[]> {
  return from(getDocs(this._rutaUsuarios)).pipe(
    map(snapshot => snapshot.docs.map(doc => doc.data() as Usuario))
  );
}

  obtenerDatosVisitas(): Observable<any> {
    return this.http.get<any>(this.functionUrl);
  }



  obtenerUsuariosNuevosPorMes(year: number): Observable<{ labels: string[]; data: number[] }> {
    const inicioAno = Timestamp.fromDate(new Date(year, 0, 1)); // Inicio del año
    const finAno = Timestamp.fromDate(new Date(year, 11, 31, 23, 59, 59)); // Fin del año

    const usuariosQuery = query(
      this._rutaUsuarios,
      where('fechaRegistro', '>=', inicioAno),
      where('fechaRegistro', '<=', finAno)
    );

    return from(getDocs(usuariosQuery)).pipe(
      map(snapshot => {
        const mesesAno = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const data = new Array(12).fill(0);

        snapshot.forEach(doc => {
          const usuario = doc.data() as Usuario;
          const mes = usuario.fechaRegistro?.toDate().getMonth() !; // Obtener el mes (0-11)
          data[mes]++;
        });

        return { labels: mesesAno, data };
      })
    );
  }




}



