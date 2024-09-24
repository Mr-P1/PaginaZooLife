import { Component, effect, inject,Signal  } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AnimalesService,Animal } from '../../data-acces/animales.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listar-animales',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './listar-animales.component.html',
  styleUrl: './listar-animales.component.scss'
})
export class ListarAnimalesComponent {
  private _animalesService = inject(AnimalesService);

  constructor(private animalesService: AnimalesService) {}

  animales: Animal[] = [];

  ngOnInit() {
    this.animalesService.getAnimales().subscribe((data: Animal[]) => {
      this.animales = data;
    });
  }

  console.log("");



}
