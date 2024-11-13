import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PremiosService } from '../../../data-acces/premios.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-premios-no-reclamados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premios-no-reclamados.component.html',
  styleUrl: './premios-no-reclamados.component.scss'
})
export class PremiosNoReclamadosComponent implements OnInit, OnDestroy{

  premiosNoReclamados: { nombre: string; noReclamados: number; reclamados: number }[] = [];
  private subscription!: Subscription;

  constructor(private premiosService: PremiosService) {}

  ngOnInit(): void {
    this.subscription = this.premiosService.getPremiosNoReclamados().subscribe({
      next: premios => {


        this.premiosNoReclamados = premios;

      },
      error: error => {
        console.error('Error al obtener premios no reclamados:', error);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
