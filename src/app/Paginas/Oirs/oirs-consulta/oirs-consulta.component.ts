import { Component } from '@angular/core';
import { OirsService, Oirs } from '../../../data-acces/oirs.service';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-oirs-consulta',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './oirs-consulta.component.html',
  styleUrls: ['./oirs-consulta.component.scss']
})
export class OirsConsultaComponent {
  oirsConsultas: (Oirs & { fechaEnvioFormatted?: string })[] = [];

  constructor(private oirsService: OirsService) { }

  ngOnInit() {
    this.oirsService.getOirsConsulta().subscribe((oirs) => {
      this.oirsConsultas = oirs.map((oir) => {
        return {
          ...oir,
          fechaEnvioFormatted: this.formatTimestampToDate(oir.fechaEnvio)
        };
      });
      console.log('OIRS de Consulta:', this.oirsConsultas);
    });
  }

  formatTimestampToDate(timestamp: Timestamp): string {
    const date = new Date(timestamp.seconds * 1000);
    // Formatear la fecha como día/mes/año
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
