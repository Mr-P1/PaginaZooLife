import { Component } from '@angular/core';
import { IonHeader, IonCardHeader, IonCardContent, IonCardTitle, IonCard, IonImg, IonContent, IonButtons, IonToolbar, IonTitle,IonMenuButton } from "@ionic/angular/standalone";
import { Router, RouterLink,RouterModule } from '@angular/router';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [IonTitle, IonToolbar, IonButtons, IonContent, IonImg, IonCard, IonCardTitle, IonCardContent, IonCardHeader, IonHeader,IonMenuButton, RouterModule, RouterLink],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.scss'
})
export class EventosComponent {

}
