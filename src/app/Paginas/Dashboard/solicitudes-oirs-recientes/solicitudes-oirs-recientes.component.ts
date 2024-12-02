import { Component, OnInit } from '@angular/core';
import { estadisticaService, Oirs } from '../estadisitca.service';
import { Observable, of } from 'rxjs';
import { AsyncPipe, DatePipe} from '@angular/common';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { OirsService } from '../../../data-acces/oirs.service';

@Component({
  selector: 'app-solicitudes-oirs-recientes',
  standalone: true,
  imports: [AsyncPipe,DatePipe,CommonModule],
  templateUrl: './solicitudes-oirs-recientes.component.html',
  styleUrl: './solicitudes-oirs-recientes.component.scss'
})
export class SolicitudesOirsRecientesComponent implements OnInit{

  recentOirsRequests$: Observable<Oirs[]> | undefined;

  constructor(private estadisticaService: estadisticaService,
    private oirsService: OirsService
  ) {}



  ngOnInit(): void {
    this.recentOirsRequests$ = this.estadisticaService.getRecentOirsRequests();
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
                      text: 'La respuesta ha sido enviada correctamente.',
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
