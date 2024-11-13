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
import { map, switchMap } from 'rxjs/operators';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import { startOfDay, endOfDay } from 'date-fns';



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
  animalId: string;
  fecha: Timestamp;
}

export interface PlantasVistas {
  plantaId: string;
  fecha: Timestamp;
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




  // oirs.service.ts

  getAverageRating(): Observable<number> {
    return collectionData(this._rutaRating, { idField: 'id' }).pipe(
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

    //Area mas visitada HOY
//   getAreasMasVisitadasHoy(): Observable<{ area: string; countQR: number; countOtros: number }[]> {
//     const todayStart = Timestamp.fromDate(startOfDay(new Date()));
//     const todayEnd = Timestamp.fromDate(endOfDay(new Date()));

//     return new Observable(observer => {
//         // Obtener datos de `AnimalesVistos`
//         const unsubscribeAnimales = onSnapshot(
//             query(this._rutaAnimalesVistos, where('fecha', '>=', todayStart), where('fecha', '<=', todayEnd)),
//             animalesVistosSnapshot => {
//                 console.log("Snapshot de AnimalesVistos obtenido:", animalesVistosSnapshot.docs.length);

//                 const conteoPorAreaQR: { [area: string]: number } = {};
//                 const conteoPorAreaOtros: { [area: string]: number } = {};

//                 const conteoPorAnimalId: { [key: string]: number } = {};

//                 // Contar cada `animalId` en `AnimalesVistos`
//                 animalesVistosSnapshot.docs.forEach(vistoDoc => {
//                     const animalVisto = vistoDoc.data() as AnimalesVistos;
//                     console.log("Animal visto:", animalVisto);
//                     conteoPorAnimalId[animalVisto.animalId] = (conteoPorAnimalId[animalVisto.animalId] || 0) + 1;
//                 });

//                 const animalIdsUnicos = Object.keys(conteoPorAnimalId);
//                 const promesasAnimales = animalIdsUnicos.map(animalId => getDoc(getFirestoreDoc(this._firestore, `Animales/${animalId}`)));

//                 Promise.all(promesasAnimales).then(resultados => {
//                     resultados.forEach(animalSnapshot => {
//                         if (animalSnapshot.exists()) {
//                             const animalData = animalSnapshot.data() as { area: string; tipoAcceso: string };
//                             console.log("Datos del animal:", animalData);

//                             const area = animalData.area;
//                             const tipoAcceso = animalData.tipoAcceso; // tipoAcceso: 'qr' o 'otro'

//                             if (tipoAcceso === 'qr') {
//                                 conteoPorAreaQR[area] = (conteoPorAreaQR[area] || 0) + conteoPorAnimalId[animalSnapshot.id];
//                             } else {
//                                 conteoPorAreaOtros[area] = (conteoPorAreaOtros[area] || 0) + conteoPorAnimalId[animalSnapshot.id];
//                             }
//                         }
//                     });

//                     const resultado = Object.keys(conteoPorAreaQR).map(area => ({
//                         area,
//                         countQR: conteoPorAreaQR[area] || 0,
//                         countOtros: conteoPorAreaOtros[area] || 0
//                     }));
//                     console.log("Resultado final:", resultado);
//                     observer.next(resultado);
//                 }).catch(error => {
//                     console.error("Error en promesas de animales:", error);
//                     observer.error(error);
//                 });
//             },
//             error => {
//                 console.error("Error en onSnapshot de AnimalesVistos:", error);
//                 observer.error(error);
//             }
//         );

//         // Desuscribirse del observador al finalizar
//         return () => unsubscribeAnimales();
//     });
// }



// getAreasMasVisitadasRealtime(): Observable<{ area: string, count: number }[]> {
//   return new Observable((observer) => {
//       // Obtener el snapshot en tiempo real de `AnimalesVistos`
//       const unsubscribe = onSnapshot(this._rutaAnimalesVistos, (animalesVistosSnapshot) => {
//           const conteoPorArea: { [area: string]: number } = {
//               'Selva Tropical': 0,
//               'Sabana Africana': 0,
//               'Acuario': 0,
//               'Montañas': 0,
//           };

//           const conteoPorAnimalId: { [key: string]: number } = {};

//           // Contar cuántas veces aparece cada animalId en AnimalesVistos
//           animalesVistosSnapshot.docs.forEach((vistoDoc) => {
//               const animalVisto = vistoDoc.data() as { animalId: string };
//               conteoPorAnimalId[animalVisto.animalId] = (conteoPorAnimalId[animalVisto.animalId] || 0) + 1;
//           });

//           // Obtener solo los datos de los animales únicos
//           const animalIdsUnicos = Object.keys(conteoPorAnimalId);
//           const promesas = animalIdsUnicos.map(animalId => {
//               const animalRef = doc(this._firestore, `Animales/${animalId}`);
//               return getDoc(animalRef);
//           });

//           // Esperar a que se resuelvan todas las promesas
//           Promise.all(promesas).then((resultados) => {
//               // Procesar cada documento de animal
//               resultados.forEach((animalSnapshot) => {
//                   if (animalSnapshot.exists()) {
//                       const animalData = animalSnapshot.data() as { area: string };
//                       const area = animalData.area;

//                       // Sumar las visitas para el área correspondiente
//                       if (conteoPorArea[area] !== undefined) {
//                           conteoPorArea[area] += conteoPorAnimalId[animalSnapshot.id];
//                       }
//                   }
//               });

//               // Convertir el objeto en un array y ordenarlo por visitas
//               const resultado = Object.entries(conteoPorArea)
//                   .map(([area, count]) => ({ area, count }))
//                   .sort((a, b) => b.count - a.count);

//               observer.next(resultado);
//           }).catch((error) => {
//               observer.error(error);
//           });
//       });

//       // Devolver función para cancelar la suscripción
//       return () => unsubscribe();
//   });
// }



getAreasMasVisitadasRealtime(): Observable<{ area: string, count: number }[]> {
  return new Observable((observer) => {
    // Obtener el snapshot en tiempo real de `AnimalesVistos`
    const unsubscribeAnimales = onSnapshot(this._rutaAnimalesVistos, (animalesVistosSnapshot) => {
      // Inicializar conteo por área con valores predefinidos para cada área
      const conteoPorArea: { [area: string]: number } = {
        'Selva Tropical': 0,
        'Sabana Africana': 0,
        'Acuario': 0,
        'Montañas': 0,
      };

      const conteoPorAnimalId: { [key: string]: number } = {};

      // Contar cuántas veces aparece cada animalId en `AnimalesVistos`
      animalesVistosSnapshot.docs.forEach((vistoDoc) => {
        const animalVisto = vistoDoc.data() as { animalId: string };
        conteoPorAnimalId[animalVisto.animalId] = (conteoPorAnimalId[animalVisto.animalId] || 0) + 1;
      });

      // Obtener solo los datos de los animales únicos
      const animalIdsUnicos = Object.keys(conteoPorAnimalId);
      const promesasAnimales = animalIdsUnicos.map(animalId => {
        const animalRef = doc(this._firestore, `Animales/${animalId}`);
        return getDoc(animalRef);
      });

      // Obtener el snapshot en tiempo real de `PlantasVistas`
      const unsubscribePlantas = onSnapshot(this._rutaPlantasVistas, (plantasVistasSnapshot) => {
        const conteoPorPlantaId: { [key: string]: number } = {};

        // Contar cuántas veces aparece cada plantaId en `PlantasVistas`
        plantasVistasSnapshot.docs.forEach((vistoDoc) => {
          const plantaVisto = vistoDoc.data() as { plantaId: string };
          conteoPorPlantaId[plantaVisto.plantaId] = (conteoPorPlantaId[plantaVisto.plantaId] || 0) + 1;
        });

        // Obtener solo los datos de las plantas únicas
        const plantaIdsUnicos = Object.keys(conteoPorPlantaId);
        const promesasPlantas = plantaIdsUnicos.map(plantaId => {
          const plantaRef = doc(this._firestore, `Plantas/${plantaId}`);
          return getDoc(plantaRef);
        });

        // Esperar a que se resuelvan todas las promesas de `Animales` y `Plantas`
        Promise.all([...promesasAnimales, ...promesasPlantas]).then((resultados) => {
          resultados.forEach((snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as { area: string };
              const area = data.area;

              if (conteoPorArea[area] === undefined) {
                conteoPorArea[area] = 0;
              }

              // Verificar si el snapshot pertenece a `AnimalesVistos` o `PlantasVistas`
              if (animalIdsUnicos.includes(snapshot.id)) {
                conteoPorArea[area] += conteoPorAnimalId[snapshot.id];
              } else if (plantaIdsUnicos.includes(snapshot.id)) {
                conteoPorArea[area] += conteoPorPlantaId[snapshot.id];
              }
            }
          });

          // Convertir el objeto en un array y ordenarlo por visitas
          const resultado = Object.entries(conteoPorArea)
            .map(([area, count]) => ({ area, count }))
            .sort((a, b) => b.count - a.count);

          observer.next(resultado);
        }).catch((error) => {
          observer.error(error);
        });
      });

      // Desuscribirse del observador de `PlantasVistas` al finalizar
      return () => unsubscribePlantas();
    });

    // Desuscribirse del observador de `AnimalesVistos` al finalizar
    return () => unsubscribeAnimales();
  });
}




}


