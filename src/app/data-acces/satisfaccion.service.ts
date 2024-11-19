import { Injectable, inject } from '@angular/core';
import { collection, Firestore, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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


}
