import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { RatingService, rating } from '../../../../data-acces/satisfaccion.service';
import { Chart } from 'chart.js';

interface RatingWithDate extends Omit<rating, 'date'> {
  date: Date;
}


@Component({
  selector: 'app-comentarios-aplicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comentarios-aplicacion.component.html',
  styleUrls: ['./comentarios-aplicacion.component.scss']
})
export class ComentariosAplicacionComponent implements OnInit {
  comments: RatingWithDate[] = [];
  filteredComments: RatingWithDate[] = [];
  paginatedComments: RatingWithDate[] = [];
  selectedRating: string = '';
  selectedYear5: number = new Date().getFullYear(); // Año seleccionado para el gráfico
  availableYears: number[] = []; // Años disponibles para el filtro
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  private chart: Chart | null = null;

  constructor(private ratingService: RatingService) {}

  ngOnInit(): void {
    this.initializeYears();
    this.loadComments();
    this.updateRatingsGraph();
  }

  // Inicializar años disponibles para el filtro
  private initializeYears(): void {
    const currentYear = new Date().getFullYear();
    const startYear = 2018; // Cambiar según los datos disponibles
    this.availableYears = Array.from(
      { length: currentYear - startYear + 1 },
      (_, i) => startYear + i
    );
  }

  // Cargar comentarios desde Firebase
  loadComments(): void {
    this.ratingService.getRatings().subscribe((data) => {
      this.comments = data.map((comment) => ({
        ...comment,
        date: comment.date.toDate(), // Convertir Timestamp a Date
      }));
      this.applyFilters();
    });
  }

// Actualizar el gráfico de calificaciones por año
updateRatingsGraph(): void {
  if (this.chart) {
    this.chart.destroy();
  }

  this.ratingService.getRatingsByYear(this.selectedYear5).subscribe(({ labels, data }: { labels: string[]; data: { [key: string]: number[] } }) => {
    const datasets = Object.keys(data).map((rating: string) => ({
      label: `${rating} Estrella${rating === '1' ? '' : 's'}`,
      data: data[rating], // Ahora TypeScript reconoce el tipo de `data[rating]`
      borderColor: this.getColorForRating(Number(rating)),
      borderWidth: 2,
      fill: false, // No rellenar el área debajo de la línea
    }));

    this.renderChart(labels, datasets);
  });
}


  // Renderizar el gráfico
  private renderChart(labels: string[], datasets: any[]): void {
    const ctx = document.getElementById('ratingsChart') as HTMLCanvasElement;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: `Satisfacción Mensual (${this.selectedYear5})`,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Número de Calificaciones',
            },
          },
        },
      },
    });
  }

  // Obtener colores para cada calificación
  private getColorForRating(rating: number): string {
    const colors: { [key: number]: string } = {
      1: 'rgba(255, 99, 132, 1)', // Rojo
      2: 'rgba(255, 159, 64, 1)', // Naranja
      3: 'rgba(255, 205, 86, 1)', // Amarillo
      4: 'rgba(75, 192, 192, 1)', // Verde
      5: 'rgba(54, 162, 235, 1)', // Azul
    };
    return colors[rating] || 'rgba(153, 102, 255, 1)'; // Predeterminado
  }

  // Aplicar filtros y reiniciar paginación
  applyFilters(): void {
    if (this.selectedRating) {
      this.filteredComments = this.comments.filter(
        (comment) => comment.rating === parseInt(this.selectedRating, 10)
      );
    } else {
      this.filteredComments = this.comments;
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  // Actualizar los elementos paginados
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedComments = this.filteredComments.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.filteredComments.length / this.pageSize);
  }

  // Cambiar de página
  changePage(direction: 'prev' | 'next'): void {
    if (direction === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    } else if (direction === 'next' && this.currentPage < this.totalPages) {
      this.currentPage++;
    }
    this.updatePagination();
  }

  // Cambiar el año y actualizar el gráfico
  onYearChange(): void {
    this.updateRatingsGraph();
  }
}
