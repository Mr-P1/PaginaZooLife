import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore, collection, addDoc, collectionData, doc, getDoc, updateDoc, query,
  where, deleteDoc, getDocs, orderBy, limit, startAfter, DocumentData,
  startAt, setDoc,
  onSnapshot
} from '@angular/fire/firestore';

import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { catchError, Observable, tap, throwError, from } from 'rxjs';
import { map, switchMap, timestamp } from 'rxjs/operators';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import { startOfDay, endOfDay } from 'date-fns';
import { startOfWeek, endOfWeek } from 'date-fns';



export interface Rating{
  comments:string,
  date:Timestamp,
  rating:number
}

export interface Oirs{
  id: string;
  archivoEvidencia?:string,
  detalles:string,
  esAfectado:boolean,
  fechaEnvio:Timestamp,
  respondido:boolean,
  tipoSolicitud:string,
  userId:string,
  respuesta?:string
}

export interface Boletas{
  fecha?:Timestamp,
  tipo:string,
}

export interface BoletasUsadas{
  fecha?:Timestamp,
  tipo:string,
  id_usuario:string
}

export interface RespuestasTrivia{
  abandonada:boolean,    //True si la abandono
  fecha:Timestamp,
  genero_usuario:string,
  pregunta_id:string,
  resultado:boolean //True si la acerto
  tiempoRespuesta:number, //Tiempo respuesta promedio
  tipo:string,
  user_id:string,
}

export interface Animal {
  id: string;
  nombre_comun: string,
  nombre_cientifico: string,
  descripcion_1: string,
  descripcion_2: string,
  descripcion_3: string,
  dato_curioso: string,
  precaucion_1: string,
  precaucion_2: string,
  precaucion_3: string,
  peso: string,
  altura: string,
  habitat: string,
  zona: string,
  dieta: string,
  comportamiento: string,
  area: string,
  estado_conservacion: string,
  clase: string,
  posicion_mapa: number,
  cuidados: string,
  disponibilidad: string,
  imagen: string,
  video?: string;
  audio?: string;
  audioAnimal?: string,
}


export interface AnimalConValoraciones extends Animal {
  likes: number;
  dislikes: number;
}

export interface Reaccion {
  id: string;
  animalId: string;  // ID del animal al que le dieron like/dislike
  userId: string;  // ID del usuario que reaccionó
  reaction: boolean;   // true para like, false para dislike
}


export interface Planta {
  id: string;
  imagen: string;
  audio?: string;
  video?: string;
  nombre_comun: string;
  nombre_cientifico: string;
  area:string,
  familia: string;
  altura: string;
  peso:string;
  descripcion_1: string;
  descripcion_2: string;
  descripcion_3: string;
  zonas: string;
  usos: string;
  cuidados: string; // cuidados buin zoo
  floracion: string;
  importancia: string;
  estado: string;
  curiosidad: string;
  precaucion: string;
  posicion_mapa: number;
}

export interface PlantaConValoraciones extends Planta {
  likes: number;
  dislikes: number;
}

export interface ReaccionPlanta {
  id: string;
  plantaId: string;  // ID de la planta a la que se reaccionó
  userId: string;  // ID del usuario que reaccionó
  reaction: boolean;   // true para like, false para dislike
}

export interface AnimalesVistos {
  animalId:string,
  area:string,
  metodoIngreso:string ,//qr, searchbar, card
  userId:string,
  vistoEn:Timestamp

}



export interface PlantasVistas {
  plantaId: string;
  area:string,
  metodoIngreso:string ,//qr, searchbar, card
  userId:string,
  vistoEn:Timestamp
}


const PATH_Animal = 'Animales';
const PATH_Mapa = 'Mapa';
const PATH_Reacciones = 'Reacciones';

const PATH_Animalesvistos = "AnimalesVistos";
const PATH_PlantasVistas = "PlantasVistas";


const PATH_Satisfaccion="ratings"
const PATH_oirs="Oirs"
const PATH_Boletas="Boletas"
const PATH_BoletasUsadas="Boletas_usadas"
const PATH_RespuestasTrivia="RespuestasTrivias"



@Injectable({
  providedIn: 'root'
})
export class estadisticaService {
  constructor(private http: HttpClient) { }

  private _firestore = inject(Firestore);

  public _rutaAnimal = collection(this._firestore, PATH_Animal);
  private _rutaReaccionesAnimales = collection(this._firestore, PATH_Reacciones);

  public _rutaPlanta = collection(this._firestore, PATH_Animal);
  private _rutaReaccionesPlantas = collection(this._firestore, PATH_Reacciones);

  private _rutaRating= collection(this._firestore, PATH_Satisfaccion)
  private _rutaOirs= collection(this._firestore, PATH_oirs)
  private _rutaBoletas= collection(this._firestore, PATH_Boletas)
  private _rutaBoletasUsadas= collection(this._firestore, PATH_BoletasUsadas)

  private _rutaPlantasVistas= collection(this._firestore, PATH_PlantasVistas)
  private _rutaAnimalesVistos= collection(this._firestore, PATH_Animalesvistos)


  private _storage = inject(Storage); // Agrega Storage




  getAverageRatingSemanaActual(): Observable<number> {
    const hoy = new Date();
    const inicioSemana = Timestamp.fromDate(startOfWeek(hoy));
    const finSemana = Timestamp.fromDate(endOfWeek(hoy));

    const ratingsQuery = query(
      this._rutaRating,
      where('date', '>=', inicioSemana),
      where('date', '<=', finSemana)
    );

    return collectionData(ratingsQuery, { idField: 'id' }).pipe(
      map((ratings: Rating[]) => {
        if (ratings.length === 0) return 0; // Evitar división por cero
        const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        return totalRating / ratings.length;
      })
    );
  }
  // En el servicio estadisticaService
  getPendingOirsCount(): Observable<number> {
    const q = query(this._rutaOirs, where("respondido", "==", false));
    return collectionData(q, { idField: 'id' }).pipe(
      map((oirs: Oirs[]) => oirs.length) // Cuenta las solicitudes pendientes
    );
  }


  //Visitas para hoy
getVisitsTodayCount(): Observable<number> {
  const todayStart = Timestamp.fromDate(startOfDay(new Date())); // Inicio del día de hoy
  const todayEnd = Timestamp.fromDate(endOfDay(new Date()));     // Fin del día de hoy

  const boletasQuery = query(this._rutaBoletas, where("fecha", ">=", todayStart), where("fecha", "<=", todayEnd));
  const boletasUsadasQuery = query(this._rutaBoletasUsadas, where("fecha", ">=", todayStart), where("fecha", "<=", todayEnd));

  // Obtener las boletas y boletas usadas de hoy y sumar sus tamaños
  const boletasToday$ = collectionData<Boletas>(boletasQuery, { idField: 'id' });
  const boletasUsadasToday$ = collectionData<BoletasUsadas>(boletasUsadasQuery, { idField: 'id' });

  return boletasToday$.pipe(
    map((boletas: Boletas[]) => boletas.length),
    switchMap((boletasCount:number) =>
      boletasUsadasToday$.pipe(
        map((boletasUsadas: BoletasUsadas[]) => boletasCount + boletasUsadas.length)
      )
    )
  );
}

  //Ingresos app hoy
  getAppIngressCount(): Observable<number> {
    const todayStart = Timestamp.fromDate(startOfDay(new Date())); // Inicio del día de hoy
    const todayEnd = Timestamp.fromDate(endOfDay(new Date()));     // Fin del día de hoy

    const boletasUsadasQuery = query(this._rutaBoletasUsadas, where("fecha", ">=", todayStart), where("fecha", "<=", todayEnd));

    // Obtener el conteo de boletas usadas de hoy
    return collectionData<BoletasUsadas>(boletasUsadasQuery, { idField: 'id' }).pipe(
      map((boletasUsadas: BoletasUsadas[]) => boletasUsadas.length) // Devuelve el número total de ingresos de hoy
    );
}

  //Oirs mas recientes
  getRecentOirsRequests(): Observable<Oirs[]> {
    // Query para obtener las 5 solicitudes de OIRS más recientes
    const recentOirsQuery = query(
      this._rutaOirs,
      orderBy("fechaEnvio", "desc"), // Ordena por fecha de envío, las más recientes primero
      limit(5)                        // Limita el resultado a 5 documentos
    );

    // Retorna la colección de datos y se actualiza en tiempo real
    return collectionData<Oirs>(recentOirsQuery, { idField: 'id' });
  }


  //popularidad animales
  getAnimalesConValoraciones(): Observable<AnimalConValoraciones[]> {
    return new Observable((observer) => {
      const unsubscribeAnimales = onSnapshot(this._rutaAnimal, (animalesSnapshot) => {
        const animales = animalesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AnimalConValoraciones[];

        const unsubscribeReacciones = onSnapshot(this._rutaReaccionesAnimales, (reaccionesSnapshot) => {
          const conteo: { [key: string]: { likes: number; dislikes: number } } = {};

          reaccionesSnapshot.docs.forEach((doc) => {
            const reaccion = doc.data() as Reaccion;
            const id = reaccion.animalId;

            if (!conteo[id]) {
              conteo[id] = { likes: 0, dislikes: 0 };
            }
            if (reaccion.reaction) {
              conteo[id].likes++;
            } else {
              conteo[id].dislikes++;
            }
          });

          const resultado = animales.map((animal) => ({
            ...animal,
            likes: conteo[animal.id]?.likes || 0,
            dislikes: conteo[animal.id]?.dislikes || 0,
          }));

          observer.next(resultado);
        });

        return () => unsubscribeReacciones();
      });

      return () => unsubscribeAnimales();
    });
  }



  getAreasMasVisitadasSemana(): Observable<{ area: string; countQR: number; countOtros: number }[]> {
    const startOfCurrentWeek = Timestamp.fromDate(startOfWeek(new Date())); // Inicio de la semana actual
    const endOfCurrentWeek = Timestamp.fromDate(endOfWeek(new Date())); // Fin de la semana actual

    // Define los valores posibles para las áreas
    type Area = 'Selva Tropical' | 'Sabana Africana' | 'Acuario' | 'Montañas';

    // Función para inicializar conteos
    const inicializarConteos = (): { QR: Record<Area, number>; Otros: Record<Area, number> } => ({
      QR: { 'Selva Tropical': 0, 'Sabana Africana': 0, 'Acuario': 0, 'Montañas': 0 },
      Otros: { 'Selva Tropical': 0, 'Sabana Africana': 0, 'Acuario': 0, 'Montañas': 0 },
    });

    return new Observable((observer) => {
      let conteoActual = inicializarConteos();

      const procesarSnapshot = (snapshot: any, tipo: string): { QR: Record<Area, number>; Otros: Record<Area, number> } => {
        const conteos = inicializarConteos();

        snapshot.docs.forEach((doc: any) => {
          const data = doc.data() as { area: Area; metodoIngreso: string };
          const area = data.area;

          if (data.metodoIngreso === 'qr') {
            conteos.QR[area]++;
          } else {
            conteos.Otros[area]++;
          }
        });

        console.log(`Datos procesados (${tipo}):`, conteos);
        return conteos;
      };

      const combinarResultados = (
        conteos1: { QR: Record<Area, number>; Otros: Record<Area, number> },
        conteos2: { QR: Record<Area, number>; Otros: Record<Area, number> }
      ): { QR: Record<Area, number>; Otros: Record<Area, number> } => {
        const resultado = inicializarConteos();

        (Object.keys(conteos1.QR) as Area[]).forEach((area) => {
          resultado.QR[area] = (conteos1.QR[area] || 0) + (conteos2.QR[area] || 0);
          resultado.Otros[area] = (conteos1.Otros[area] || 0) + (conteos2.Otros[area] || 0);
        });

        return resultado;
      };

      const enviarResultado = () => {
        const resultado = (Object.keys(conteoActual.QR) as Area[]).map((area) => ({
          area,
          countQR: conteoActual.QR[area],
          countOtros: conteoActual.Otros[area],
        }));

        console.log('Resultado final:', resultado);
        observer.next(resultado);
      };

      const unsubscribeAnimales = onSnapshot(
        query(this._rutaAnimalesVistos, where('vistoEn', '>=', startOfCurrentWeek), where('vistoEn', '<=', endOfCurrentWeek)),
        (snapshot) => {
          const conteosAnimales = procesarSnapshot(snapshot, 'Animales');
          conteoActual = combinarResultados(conteosAnimales, conteoActual);
          enviarResultado();
        }
      );

      const unsubscribePlantas = onSnapshot(
        query(this._rutaPlantasVistas, where('vistoEn', '>=', startOfCurrentWeek), where('vistoEn', '<=', endOfCurrentWeek)),
        (snapshot) => {
          const conteosPlantas = procesarSnapshot(snapshot, 'Plantas');
          conteoActual = combinarResultados(conteoActual, conteosPlantas);
          enviarResultado();
        }
      );

      return () => {
        unsubscribeAnimales();
        unsubscribePlantas();
      };
    });
  }




}


