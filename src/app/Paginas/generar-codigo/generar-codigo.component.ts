import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Component, ElementRef, ViewChild, SecurityContext, OnInit } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { BoletasService, Usuario } from '../../data-acces/boletas.service';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { CorreoService } from '../../data-acces/correo.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-generar-codigo',
  standalone: true,
  imports: [QRCodeModule, CommonModule, FormsModule],
  templateUrl: './generar-codigo.component.html',
  styleUrls: ['./generar-codigo.component.scss']
})
export class GenerarCodigoComponent implements OnInit {
  public usuarios: Usuario[] = [];

  public qrData!: string;
  public boletaId!: string;
  public qrGenerado: boolean = false;
  public qrCodeDownloadLink: SafeUrl = '';

  @ViewChild('qrcode', { static: false }) qrcodeElement!: ElementRef;
  public correoSeleccionado: string = '';

  constructor(
    private boletasService: BoletasService,
    private correoService: CorreoService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.boletasService.obtenerUsuarios().subscribe(
      (usuarios) => {
        this.usuarios = usuarios;
      },
      (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    );
  }

  generarIdBoleta(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  generarQr(): void {
    this.boletaId = this.generarIdBoleta();
    this.qrData = this.boletaId;
    this.qrGenerado = true;

    const nuevaBoleta = {
      id: this.boletaId,
      tipo: 'general',
      fecha: Timestamp.fromDate(new Date()),
    };

    this.boletasService
      .guardarBoleta(nuevaBoleta)
      .then(() => {
        console.log('Boleta guardada en Firebase');
        this.convertirQrABase64(); // Convertir el QR a base64 cuando el QR esté disponible
      })
      .catch((error) => {
        console.error('Error al guardar la boleta en Firebase:', error);
      });
  }

  convertirQrABase64(): void {
    const canvas = this.qrcodeElement.nativeElement.querySelector('canvas');
    if (canvas) {
      this.qrCodeDownloadLink =
        this.sanitizer.sanitize(SecurityContext.URL, canvas.toDataURL('image/png')) || '';
    }
  }

  // ('../../../assets/plants-leaves-green-1841479-wallhere.com.jpg') ;

  foto = '../../../assets/'

  sendEmail(correo: string): void {
    if (!correo) {
      Swal.fire({
        title: 'Error',
        text: 'Selecciona un correo primero',
        icon: 'error',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    if (!this.qrCodeDownloadLink) {
      Swal.fire({
        title: 'Error',
        text: 'Vuelva a intentarlo más tarde',
        icon: 'error',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    const formContent = `
     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <h2 style="text-align: center; ">🎟️ ¡Tu QR está aquí!</h2>
  <p style="font-size: 16px; ">
    Hola,
  </p>
  <p style="font-size: 16px; ">
    Te enviamos tu código QR asociado a tu boleta. Puedes utilizar este QR para
    acceder a la aplicación ZooLife y disfrutar de una experiencia inolvidable.
  </p>
  <p style="font-size: 14px;  text-align: center;">
    Asegúrate de guardar este correo y escanear el QR en tu aplicación. Si
    tienes alguna pregunta, no dudes en contactarnos.
  </p>
  <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.5); margin: 20px 0;" />
  <p style="font-size: 12px;  text-align: center;">
    Este es un correo generado automáticamente, por favor no respondas a este
    mensaje.
  </p>
  <p style="font-size: 12px;  text-align: center;">
    © 2024 Buin Zoo. Todos los derechos reservados.
  </p>
  </div>

  `;

    const destinatario = correo;

    const emailData = {
      formContent,
      destinatario,
      attachment: this.qrCodeDownloadLink,
    };

    this.correoService.sendEmailWithAttachment(emailData).subscribe(
      (response) => {
        console.log('Correo enviado con éxito:', response);
        Swal.fire({
          title: '¡Enviado!',
          text: 'Correo enviado con éxito',
          icon: 'success',
          confirmButtonText: 'Entendido',
        });
      },
      (error) => {
        console.error('Error al enviar el correo:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo enviar el correo',
          icon: 'error',
          confirmButtonText: 'Entendido',
        });
      }
    );
  }


}
