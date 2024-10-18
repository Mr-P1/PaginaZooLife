import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, collectionData, query, where, orderBy ,updateDoc} from '@angular/fire/firestore';
import { Observable } from 'rxjs';


interface ChatMessage {
  id: string;
  chatId: string;
  visitorId: string;
  sender: 'admin' | 'visitor';
  message: string;
  timestamp: Date;
  seenByAdmin: boolean;
  seenByVisitor: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private firestore: Firestore) {}

  getMessages(visitorId: string): Observable<any[]> {
    const messagesRef = collection(this.firestore, 'chats');
    const q = query(messagesRef, where('visitorId', '==', visitorId), orderBy('timestamp'));
    return collectionData(q, { idField: 'id' });
  }

  sendMessage(visitorId: string, message: string, sender: 'admin' | 'visitor') {
    const timestamp = new Date();
    const chatId = doc(collection(this.firestore, 'chats')).id;
    const chatRef = doc(this.firestore, 'chats', chatId);

    return setDoc(chatRef, {
      chatId,
      visitorId,
      sender,
      message,
      timestamp,
      seenByAdmin: sender === 'admin' ? true : false, // Marcado como visto si lo envía el admin
      seenByVisitor: sender === 'visitor' ? true : false // Marcado como visto si lo envía el visitante
    });
  }

   // Marcar mensajes como leídos por el administrador
   markMessagesAsReadByAdmin(visitorId: string) {
    const messagesRef = collection(this.firestore, 'chats');
    const q = query(messagesRef, where('visitorId', '==', visitorId), where('seenByAdmin', '==', false));

    collectionData(q, { idField: 'id' }).subscribe((messages: ChatMessage[]) => {
      messages.forEach(message => {
        const messageRef = doc(this.firestore, 'chats', message.id);
        updateDoc(messageRef, { seenByAdmin: true });
      });
    });
  }




}
