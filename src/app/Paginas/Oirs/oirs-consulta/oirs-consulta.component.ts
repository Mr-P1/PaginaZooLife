import { Component } from '@angular/core';
import { OirsService, Oirs } from '../../../data-acces/oirs.service';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-oirs-consulta',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './oirs-consulta.component.html',
  styleUrls: ['./oirs-consulta.component.scss']
})
export class OirsConsultaComponent {
  oirsConsultas: (Oirs & { fechaEnvioFormatted?: string })[] = [];

  constructor(private oirsService: OirsService) {}

  ngOnInit() {
    this.oirsService.getOirsConsulta().subscribe((oirs) => {
      this.oirsConsultas = oirs.map((oir) => {
        return {
          ...oir,
          fechaEnvioFormatted: this.formatTimestampToDate(oir.fechaEnvio)
        };
      });
      console.log('OIRS de Consulta:', this.oirsConsultas);
    });
  }

  formatTimestampToDate(timestamp: Timestamp): string {
    const date = new Date(timestamp.seconds * 1000);
    // Formatear la fecha como día/mes/año
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
