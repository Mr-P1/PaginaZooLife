import { Component, SecurityContext } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BoletasService } from '../,,/../../data-acces/boletas.service'; // Importa tu servicio de Boletas
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-generar-codigo',
  standalone: true,
  imports: [QRCodeModule,CommonModule],
  templateUrl: './generar-codigo.component.html',
  styleUrl: './generar-codigo.component.scss'
})
export class GenerarCodigoComponent {
  public qrData!: string;
  public boletaId!: string;
  public qrCodeDownloadLink: SafeUrl = '';
  public qrGenerado: boolean = false; // Indica si el QR ha sido generado

  constructor(private sanitizer: DomSanitizer, private boletasService: BoletasService) {}

  generarIdBoleta(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  generarQr(): void {
    // Genera un nuevo ID de boleta
    this.boletaId = this.generarIdBoleta();
    this.qrData =this.boletaId;
    this.qrGenerado = true; // Marcar que el QR ha sido generado

    // Crear la boleta y guardarla en Firebase
    const nuevaBoleta = {
      id: this.boletaId,
      tipo: 'general', // Aquí puedes poner el tipo que corresponda
      fecha: Timestamp.fromDate(new Date())
    };

    this.boletasService.guardarBoleta(nuevaBoleta).then(() => {
      console.log('Boleta guardada en Firebase');
    }).catch(error => {
      console.error('Error al guardar la boleta en Firebase:', error);
    });
  }

  onChangeURL(url: SafeUrl): void {
    // Captura el URL generado y lo almacena para descarga
    this.qrCodeDownloadLink = this.sanitizer.sanitize(SecurityContext.URL, url) || '';
  }

  descargarQr(): void {
    // Lógica para descargar el QR
    const link = document.createElement('a');
    link.href = this.qrCodeDownloadLink as string;
    link.download = `qr-code-${this.boletaId}.png`;
    link.click();
  }

  enviarCorreo(): void {
    alert(`Enviando correo con el QR asociado a la boleta ID: ${this.boletaId}...`);
    // Implementa la lógica para enviar el correo usando un servicio backend
  }

}
