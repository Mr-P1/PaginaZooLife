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

  sendEmailWithAttachment(emailData: { formContent: string, destinatario: string, attachment: any }): Observable<any> {
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
