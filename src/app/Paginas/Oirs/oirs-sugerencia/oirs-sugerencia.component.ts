import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OirsService, Oirs } from '../../../data-acces/oirs.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-oirs-sugerencia',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './oirs-sugerencia.component.html',
  styleUrls: ['./oirs-sugerencia.component.scss']
})
export class OirsSugerenciaComponent implements OnInit {
  oirsSugerencias: Oirs[] = [];

  constructor(private oirsService: OirsService) {}

  ngOnInit() {
    this.oirsService.getOirsSugerencia().subscribe({
      next: (oirs) => {
        this.oirsSugerencias = oirs;
        console.log('OIRS de Sugerencia:', this.oirsSugerencias);
      },
      error: (error) => {
        console.error('Error al obtener OIRS de sugerencia:', error);
      }
    });
  }
}
