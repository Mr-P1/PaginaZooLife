// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Component, OnInit } from '@angular/core';
// import { RatingService, rating } from '../../../../data-acces/satisfaccion.service';

// @Component({
//   selector: 'app-comentarios-aplicacion',
//   standalone: true,
//   imports: [CommonModule,FormsModule],
//   templateUrl: './comentarios-aplicacion.component.html',
//   styleUrl: './comentarios-aplicacion.component.scss'
// })
// export class ComentariosAplicacionComponent implements OnInit{

//   comments: rating[] = [];
//   filteredComments: rating[] = [];
//   paginatedComments: rating[] = [];
//   selectedRating: string = '';
//   currentPage: number = 1;
//   pageSize: number = 5;
//   totalPages: number = 0;

//   constructor(private ratingService: RatingService) {}

//   ngOnInit(): void {
//     this.loadComments();
//   }

//   loadComments(): void {
//     this.ratingService.getRatings().subscribe((data) => {
//       this.comments = data;
//       this.applyFilters();
//     });
//   }

//   applyFilters(): void {
//     if (this.selectedRating) {
//       this.filteredComments = this.comments.filter(
//         (comment) => comment.rating === parseInt(this.selectedRating, 10)
//       );
//     } else {
//       this.filteredComments = this.comments;
//     }
//     this.currentPage = 1;
//     this.updatePagination();
//   }

//   updatePagination(): void {
//     const startIndex = (this.currentPage - 1) * this.pageSize;
//     const endIndex = startIndex + this.pageSize;
//     this.paginatedComments = this.filteredComments.slice(startIndex, endIndex);
//     this.totalPages = Math.ceil(this.filteredComments.length / this.pageSize);
//   }

//   changePage(direction: 'prev' | 'next'): void {
//     if (direction === 'prev' && this.currentPage > 1) {
//       this.currentPage--;
//     } else if (direction === 'next' && this.currentPage < this.totalPages) {
//       this.currentPage++;
//     }
//     this.updatePagination();
//   }


// }


import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { RatingService, rating } from '../../../../data-acces/satisfaccion.service';

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
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;

  constructor(private ratingService: RatingService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  // Cargar comentarios desde Firebase
  loadComments(): void {
    this.ratingService.getRatings().subscribe((data) => {
      this.comments = data.map((comment) => ({
        ...comment,
        date: comment.date.toDate() // Convertir Timestamp a Date
      }));
      this.applyFilters();
    });
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
}
