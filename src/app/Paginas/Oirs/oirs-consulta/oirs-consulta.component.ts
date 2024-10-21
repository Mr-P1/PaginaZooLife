import { Component } from '@angular/core';
import {OirsService, Oirs } from '../../../data-acces/oirs.service'
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-oirs-consulta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oirs-consulta.component.html',
  styleUrl: './oirs-consulta.component.scss'
})
export class OirsConsultaComponent {
  oirsConsultas: Oirs[] = [];

  constructor(private oirsService: OirsService) {}

  ngOnInit() {
    this.oirsService.getOirsConsulta().subscribe((oirs) => {
      this.oirsConsultas = oirs.map((oir) => {

        return {
          ...oir,
        };
      });
      console.log('OIRS de Consulta:', this.oirsConsultas);
    });
  }

}
