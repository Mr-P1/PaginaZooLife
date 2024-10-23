import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OirsService, Oirs, Usuario } from '../../../data-acces/oirs.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-oirs-felicitacion',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './oirs-felicitacion.component.html',
  styleUrls: ['./oirs-felicitacion.component.scss']
})
export class OirsFelicitacionComponent implements OnInit {
  oirsFelicitaciones: (Oirs & { usuario?: Usuario })[] = [];

  constructor(private oirsService: OirsService) {}

  ngOnInit() {
    this.oirsService.getOirsFelicitacion().subscribe({
      next: (oirs) => {
        this.oirsFelicitaciones = oirs;
        console.log('OIRS de Felicitación con usuarios:', this.oirsFelicitaciones);
      },
      error: (error) => {
        console.error('Error al obtener OIRS de felicitación:', error);
      }
    });
  }
}
