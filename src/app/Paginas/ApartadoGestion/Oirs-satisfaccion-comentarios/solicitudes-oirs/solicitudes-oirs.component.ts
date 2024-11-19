import { Component, OnInit } from '@angular/core';
import {OirsService,Oirs} from '../../../../data-acces/oirs.service'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitudes-oirs',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './solicitudes-oirs.component.html',
  styleUrl: './solicitudes-oirs.component.scss'
})
export class SolicitudesOirsComponent implements OnInit{

  oirsList: Oirs[] = [];
  currentPage: number = 1;
  pageSize: number = 5;

  filters = {
    tipoSolicitud: '',
    estadoSolicitud: '',
  };

  constructor(private oirsService: OirsService) {}

  ngOnInit(): void {
    this.applyFilters();
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
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const respuesta = result.value;

        // Obtén el correo del usuario y luego envía el correo y actualiza el estado del OIRS
        this.oirsService.getUsuarioEmailByAuthId(oirUserId).subscribe({
          next: (correo) => {
            if (correo) {
              // Enviar el correo con la respuesta
              this.oirsService.sendEmail(correo, respuesta).subscribe({
                next: () => {
                  console.log('Correo enviado correctamente.');

                  // Actualizar el estado del OIRS en Firestore
                  this.oirsService.updateOirsResponse(oirId, respuesta).then(() => {
                    console.log('OIRS actualizado correctamente.');
                    Swal.fire({
                      title: 'Respuesta Enviada',
                      text: 'La respuesta ha sido enviada y el OIRS ha sido actualizado.',
                      icon: 'success'
                    });
                  }).catch((error) => {
                    console.error('Error al actualizar el OIRS:', error);
                    Swal.fire({
                      title: 'Error',
                      text: 'Hubo un error al actualizar el OIRS.',
                      icon: 'error'
                    });
                  });
                },
                error: (error) => {
                  console.error('Error al enviar el correo:', error);
                  Swal.fire({
                    title: 'Error',
                    text: 'Hubo un error al enviar el correo.',
                    icon: 'error'
                  });
                }
              });
            } else {
              Swal.fire({
                title: 'Usuario No Encontrado',
                text: 'No se encontró el correo electrónico del usuario.',
                icon: 'error'
              });
            }
          },
          error: (error) => {
            console.error('Error al obtener el correo del usuario:', error);
            Swal.fire({
              title: 'Error',
              text: 'Hubo un error al obtener el correo del usuario.',
              icon: 'error'
            });
          }
        });
      }
    });
  }
}
