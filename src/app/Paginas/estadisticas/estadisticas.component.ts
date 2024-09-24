import { Component, OnInit } from '@angular/core';
import { AnimalesService, AnimalConValoraciones } from '../../data-acces/animales.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss'
})
export class EstadisticasComponent implements OnInit {

  animales: AnimalConValoraciones[] = [];


  constructor(
    private _animalesService : AnimalesService
  ){}

  ngOnInit(): void {
    this.cargarAnimalesConValoraciones();
  }


  async cargarAnimalesConValoraciones() {
    this.animales = await this._animalesService.getAnimalesConValoraciones();
  }

}
