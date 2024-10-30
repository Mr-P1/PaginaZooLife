// import { Injectable, inject } from '@angular/core';
// import { Firestore } from '@angular/fire/firestore';
// import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importa HttpClient y HttpHeaders
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class CorreoService {
//   private _firestore = inject(Firestore);
//   private functionUrl = 'https://us-central1-appzoolife.cloudfunctions.net/helloworld'; // Reemplaza con la URL de tu función


//   // Inyecta HttpClient en el constructor
//   constructor(private http: HttpClient) {}

//   // Función para enviar el correo
//   sendEmail(formContent: string, destinatario: string): Observable<any> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     const body = {
//       secret: 'firebaseIsCool', // El secreto para validar la solicitud en Firebase
//       form: formContent, // El contenido HTML del correo
//       to: destinatario // El correo del destinatario
//     };

//     // Realiza la solicitud POST a la función de Firebase
//     return this.http.post(this.functionUrl, body, { headers });
//   }

//   sendEmailWithAttachment(emailData: { formContent: string, destinatario: string, attachment: string }): Observable<any> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     const body = {
//       secret: 'firebaseIsCool', // El secreto para validar la solicitud en Firebase
//       form: emailData.formContent,
//       to: emailData.destinatario,
//       attachment: emailData.attachment // Base64 del QR como adjunto
//     };

//     return this.http.post(this.functionUrl, body, { headers });
//   }




// }


import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CorreoService {
  private _firestore = inject(Firestore);
  private functionUrl = 'https://us-central1-appzoolife.cloudfunctions.net/helloworld';

  constructor(private http: HttpClient) {}

  sendEmailWithAttachment(emailData: { formContent: string, destinatario: string, attachment: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      secret: 'firebaseIsCool',
      form: emailData.formContent,
      to: emailData.destinatario,
      attachment: emailData.attachment
    };

    return this.http.post(this.functionUrl, body, { headers });
  }
}
