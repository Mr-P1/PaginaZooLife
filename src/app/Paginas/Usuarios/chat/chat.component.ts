import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../../data-acces/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {

  idActiva = "";
  messages: any[] = [];
  newMessage: string = '';

  constructor(
    private _rutaActiva: ActivatedRoute,
    private chatService: ChatService
  ) { }

  ngOnInit() {
    this._rutaActiva.paramMap.subscribe(data => {
      this.idActiva = data.get("IdUsuario")!;
      this.chatService.getMessages(this.idActiva).subscribe(messages => {
        this.messages = messages;

        // Marcar como leídos todos los mensajes que aún no fueron leídos por el admin
        this.chatService.markMessagesAsReadByAdmin(this.idActiva);
      });
    });
  }

  sendMessage() {
    if (this.newMessage.trim() !== '') {
      this.chatService.sendMessage(this.idActiva, this.newMessage, 'admin').then(() => {
        this.newMessage = '';
      });
    }
  }



}
