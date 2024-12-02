import { Component, OnInit } from '@angular/core';
import { OirsService, Oirs } from '../../../../data-acces/oirs.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-solicitudes-oirs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes-oirs.component.html',
  styleUrl: './solicitudes-oirs.component.scss',
})
export class SolicitudesOirsComponent implements OnInit {
  oirsList: Oirs[] = [];
  currentPage: number = 1;
  pageSize: number = 5;

  selectedYear3: number = new Date().getFullYear();
  availableYears: number[] = [];

  filters = {
    tipoSolicitud: '',
    estadoSolicitud: '',
  };

  private chart: Chart | null = null;

  constructor(private oirsService: OirsService) {}

  ngOnInit(): void {
    this.initializeYears();
    this.applyFilters();
    this.updateOirsGraph();
  }

  // Inicializa los años disponibles en el filtro
  private initializeYears(): void {
    const currentYear = new Date().getFullYear();
    const startYear = 2018; // Cambia esto según los datos disponibles
    this.availableYears = Array.from(
      { length: currentYear - startYear + 1 },
      (_, i) => startYear + i
    );
  }

  // Actualiza el gráfico de OIRS por año
  updateOirsGraph(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    this.oirsService.getOirsPorAnoDesglosado(this.selectedYear3).subscribe(
      ({ labels, data }) => {
        const datasets = Object.keys(data).map((tipo) => ({
          label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
          data: data[tipo],
          borderColor: this.getColorForType(tipo),
          backgroundColor: this.getColorForType(tipo, 0.2),
          fill: false,
        }));

        this.renderChart(labels, datasets);
      }
    );
  }

  // Genera el gráfico con los datos obtenidos
  private renderChart(labels: string[], datasets: any[]): void {
    const ctx = document.getElementById('oirsChart') as HTMLCanvasElement;

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
            text: `Solicitudes OIRS (${this.selectedYear3})`,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  // Obtiene el color para cada tipo de solicitud
  private getColorForType(tipo: string, alpha = 1): string {
    const colors: { [key: string]: string } = {
      sugerencia: `rgba(54, 162, 235, ${alpha})`,
      felicitacion: `rgba(75, 192, 192, ${alpha})`,
      consulta: `rgba(255, 206, 86, ${alpha})`,
      reclamo: `rgba(255, 99, 132, ${alpha})`,
    };
    return colors[tipo] || `rgba(153, 102, 255, ${alpha})`; // Color predeterminado
  }

  // Aplica los filtros y actualiza la lista
  applyFilters(): void {
    const { tipoSolicitud, estadoSolicitud } = this.filters;
    this.oirsService
      .getFilteredOirs(tipoSolicitud, estadoSolicitud)
      .subscribe((data) => {
        this.oirsList = data;
        this.currentPage = 1; // Reinicia a la primera página
      });
  }

  // Obtiene la lista de OIRS de la página actual
  getPaginatedOirs(): Oirs[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.oirsList.slice(startIndex, endIndex);
  }

  // Cambia la página
  changePage(direction: 'prev' | 'next'): void {
    if (direction === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    } else if (direction === 'next' && this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  // Total de páginas
  getTotalPages(): number {
    return Math.ceil(this.oirsList.length / this.pageSize);
  }

  responderOIR(oirUserId: string, oirId: string) {
    Swal.fire({
      title: 'Responder Consulta',
      input: 'textarea',
      inputLabel: 'Respuesta',
      inputPlaceholder: 'Escribe tu respuesta aquí...',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      preConfirm: (respuesta) => {
        if (!respuesta) {
          Swal.showValidationMessage('Por favor, escribe una respuesta');
          return false;
        }
        return respuesta;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const respuesta = result.value;

        this.oirsService.getUsuarioEmailByAuthId(oirUserId).subscribe({
          next: (correo) => {
            if (correo) {
              this.oirsService.sendEmail(correo, respuesta).subscribe({
                next: () => {
                  this.oirsService.updateOirsResponse(oirId, respuesta).then(() => {
                    Swal.fire({
                      title: 'Respuesta Enviada',
                      text: 'La respuesta ha sido enviada correctamente.',
                      icon: 'success',
                    });
                  });
                },
                error: () => {
                  Swal.fire({
                    title: 'Error',
                    text: 'Hubo un error al enviar el correo.',
                    icon: 'error',
                  });
                },
              });
            } else {
              Swal.fire({
                title: 'Usuario No Encontrado',
                text: 'No se encontró el correo electrónico del usuario.',
                icon: 'error',
              });
            }
          },
          error: () => {
            Swal.fire({
              title: 'Error',
              text: 'Hubo un error al obtener el correo del usuario.',
              icon: 'error',
            });
          },
        });
      }
    });
  }
}
