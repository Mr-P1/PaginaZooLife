import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OirsService, Oirs } from '../../../data-acces/oirs.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-oirs-reclamo',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './oirs-reclamo.component.html',
  styleUrls: ['./oirs-reclamo.component.scss']
})
export class OirsReclamoComponent implements OnInit {
  oirsReclamos: Oirs[] = [];

  constructor(private oirsService: OirsService) {}

  ngOnInit() {
    this.oirsService.getOirsReclamo().subscribe({
      next: (oirs) => {
        this.oirsReclamos = oirs;
        console.log('OIRS de Reclamo:', this.oirsReclamos);
      },
      error: (error) => {
        console.error('Error al obtener OIRS de reclamo:', error);
      }
    });
  }
}
