import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private _firestore = inject(Firestore);
  private functionUrl = 'https://us-central1-appzoolife.cloudfunctions.net/sendPushNotification';

  constructor(private http: HttpClient) {}


  sendPushNotification2(tokens: string[], data: any = {}): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      secret: 'firebaseIsCool',
      tokens:tokens,
      data:data,
    };

    return this.http.post<any>(this.functionUrl, body, { headers });
  }



  // Agrega title, body y imageUrl como parámetros opcionales
  sendPushNotification3(tokens: string[], title: string, bodyContent: string, imageUrl: string | null = null, data: any = {}): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      secret: 'firebaseIsCool',
      tokens: tokens,
      title: title,       // Agrega el título al cuerpo
      body: bodyContent,   // Agrega el contenido al cuerpo
      imageUrl: imageUrl,  // Agrega la URL de la imagen (opcional)
      data: data           // Datos adicionales opcionales
    };

    return this.http.post<any>(this.functionUrl, body, { headers });
  }





}



  // sendPushNotification(tokens: string[], data: any = {}, secret: string = 'firebaseIsCool'): Observable<any> {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json'
  //   });

  //   const body = {
  //     tokens,
  //     data,
  //     secret
  //   };

  //   return this.http.post<any>(this.functionUrl, body, { headers });
  // }
