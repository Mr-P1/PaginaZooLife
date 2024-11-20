import { Injectable, inject } from '@angular/core';
import { collection, Firestore, collectionData, where, query } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';

export interface rating {
  id: string;
  comments: string,
  date: Timestamp,
  rating: number,
}




const PATH_Rating = 'ratings'




@Injectable({
  providedIn: 'root'
})
export class RatingService {
  constructor(private http: HttpClient) { }

  private _firestore = inject(Firestore);
  private _rutaRatings = collection(this._firestore, PATH_Rating);

  getRatings(): Observable<rating[]> {
    return collectionData(this._rutaRatings, { idField: 'id' }) as Observable<rating[]>;
  }


    // Obtiene las calificaciones desglosadas por mes y calificación (1 a 5 estrellas)
    getRatingsByYear(year: number): Observable<{ labels: string[]; data: Record<number, number[]> }> {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);

      const ratingsQuery = query(
        this._rutaRatings,
        where('date', '>=', Timestamp.fromDate(startOfYear)),
        where('date', '<=', Timestamp.fromDate(endOfYear))
      );

      return collectionData(ratingsQuery, { idField: 'id' }).pipe(
        map((ratings: rating[]) => {
          const monthlyData = Array.from({ length: 12 }, () => Array(5).fill(0)); // 12 meses, 5 estrellas

          ratings.forEach((rating) => {
            const date = rating.date.toDate();
            const month = date.getMonth(); // 0-11
            const stars = rating.rating - 1; // 1-5 -> 0-4
            if (month >= 0 && month < 12 && stars >= 0 && stars < 5) {
              monthlyData[month][stars]++;
            }
          });

          return {
            labels: [
              'Enero',
              'Febrero',
              'Marzo',
              'Abril',
              'Mayo',
              'Junio',
              'Julio',
              'Agosto',
              'Septiembre',
              'Octubre',
              'Noviembre',
              'Diciembre',
            ],
            data: {
              1: monthlyData.map((m) => m[0]),
              2: monthlyData.map((m) => m[1]),
              3: monthlyData.map((m) => m[2]),
              4: monthlyData.map((m) => m[3]),
              5: monthlyData.map((m) => m[4]),
            },
          };
        })
      );
    }


}
