import { Component, OnInit} from '@angular/core';
import { RecompensaService } from '../../../../data-acces/recompensas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-recompensas',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './recompensas.component.html',
  styleUrl: './recompensas.component.scss'
})
export class RecompensasComponent implements OnInit{
  recompensas: any[] = [];
  filters = {
    estado: '',
  };
  currentPage: number = 1;
  pageSize: number = 5;
  isLoading: boolean = false;

  constructor(private recompensaService: RecompensaService) {}

  ngOnInit(): void {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.isLoading = true;
    this.recompensaService
      .getFilteredPremiosUsuario(this.filters.estado)
      .subscribe({
        next: (data) => {
          this.recompensas = data;
          this.currentPage = 1;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar recompensas:', err);
          this.isLoading = false;
        },
      });
  }

  getPaginatedRecompensas(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.recompensas.slice(startIndex, endIndex);
  }

  cambiarPagina(direccion: 'prev' | 'next'): void {
    if (direccion === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    } else if (direccion === 'next' && this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.recompensas.length / this.pageSize);
  }

  reclamarPremio(idPremioUsuario: string): void {
    this.recompensaService.actualizarEstadoPremio(idPremioUsuario).then(() => {
      this.aplicarFiltros();
    });
  }

}
