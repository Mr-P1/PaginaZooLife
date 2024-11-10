import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OirsService, Oirs } from '../../../data-acces/oirs.service';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-oirs-reclamo',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './oirs-reclamo.component.html',
  styleUrls: ['./oirs-reclamo.component.scss']
})
export class OirsReclamoComponent implements OnInit {
  oirsReclamos: (Oirs & { usuario?: any })[] = [];

  constructor(private oirsService: OirsService) {}

  ngOnInit() {
    this.oirsService.getOirsReclamo().subscribe({
      next: (oirs) => {
        this.oirsReclamos = oirs;
        console.log('OIRS de Reclamo:', this.oirsReclamos);
      },
      error: (error) => {
        console.error('Error al obtener OIRS de reclamo:', error);
      }
    });
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
