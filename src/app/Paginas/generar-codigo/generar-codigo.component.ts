import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Component, ElementRef, ViewChild, SecurityContext } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { BoletasService } from '../../data-acces/boletas.service';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { CorreoService } from '../../data-acces/correo.service';

@Component({
  selector: 'app-generar-codigo',
  standalone: true,
  imports: [QRCodeModule, CommonModule],
  templateUrl: './generar-codigo.component.html',
  styleUrls: ['./generar-codigo.component.scss']
})
export class GenerarCodigoComponent {
  public qrData!: string;
  public boletaId!: string;
  public qrGenerado: boolean = false;
  public qrCodeBase64: string = ''; // Base64 del QR
  public qrCodeDownloadLink: SafeUrl = '';

  @ViewChild('qrcode', { static: false }) qrcodeElement!: ElementRef;

  constructor(
    private boletasService: BoletasService,
    private correoService: CorreoService,
    private sanitizer: DomSanitizer
  ) { }

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
      fecha: Timestamp.fromDate(new Date())
    };

    this.boletasService.guardarBoleta(nuevaBoleta).then(() => {
      console.log('Boleta guardada en Firebase');

      // Convertir el QR a base64 cuando el QR esté disponible
      this.convertirQrABase64();

    }).catch(error => {
      console.error('Error al guardar la boleta en Firebase:', error);
    });
  }

  convertirQrABase64(): void {
    const canvas = this.qrcodeElement.nativeElement.querySelector('canvas');
    if (canvas) {
      this.qrCodeBase64 = canvas.toDataURL('image/png').split(',')[1]; // Convertir a base64 y eliminar el encabezado
      this.qrCodeDownloadLink = this.sanitizer.sanitize(SecurityContext.URL, canvas.toDataURL('image/png')) || '';
    }
  }

sendEmail(): void {
  if (!this.qrCodeBase64) {
    console.error("El código QR no está listo en formato base64");
    return;
  }

  const formContent = `
    <p>¡Hola! Aquí tienes el código QR asociado a tu boleta:</p>
    <p>Puedes usar este código QR directamente para tus propósitos.</p>


    <p>Qr en formato base64</p>
    <p>${this.qrCodeBase64}</p>

    <p>-------------------------</p>
  `;

  const destinatario = "salvojose84@gmail.com";

  const emailData = {
    formContent,
    destinatario,
    attachment: this.qrCodeBase64 // Base64 del QR como adjunto
  };

  this.correoService.sendEmailWithAttachment(emailData).subscribe(
    (response) => {
      console.log('Correo enviado con éxito:', response);
      alert('Correo enviado con éxito');
    },
    (error) => {
      console.error('Error al enviar el correo:', error);
    }
  );
}




}
