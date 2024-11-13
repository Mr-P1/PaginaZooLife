import { Component, OnInit } from '@angular/core';
import { estadisticaService } from '../estadisitca.service';
import { AnimalesService, AnimalConValoraciones } from '../../../data-acces/animales.service';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';

@Component({
  selector: 'app-popularidad-animal',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './popularidad-animal.component.html',
  styleUrl: './popularidad-animal.component.scss'
})
export class PopularidadAnimalComponent implements OnInit{


  searchText: string = '';
  isPreviousDisabled: boolean = true;
  isNextDisabled: boolean = false;

  private animalesSubscription!: Subscription;

  animales: AnimalConValoraciones[] = [];

  constructor(private estadisticaService: estadisticaService) {}

  ngOnInit(): void {



    this.animalesSubscription = this.estadisticaService.getAnimalesConValoraciones().subscribe({
      next: (animales) => {
        this.animales = animales;
      },
      error: (error) => console.error('Error al obtener animales:', error)
    });
  }


  searchAnimals() {

  }

  nextPage() {

  }

  previousPage() {
  }
}
