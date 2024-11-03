import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Component, ElementRef, ViewChild, SecurityContext, OnInit } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { BoletasService,Usuario } from '../../data-acces/boletas.service';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { CorreoService } from '../../data-acces/correo.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-generar-codigo',
  standalone: true,
  imports: [QRCodeModule, CommonModule,FormsModule],
  templateUrl: './generar-codigo.component.html',
  styleUrls: ['./generar-codigo.component.scss']
})
export class GenerarCodigoComponent implements OnInit{
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
      this.qrCodeDownloadLink = this.sanitizer.sanitize(SecurityContext.URL, canvas.toDataURL('image/png')) || '';
    }
  }

sendEmail(correo:string): void {

  if (!this.qrCodeDownloadLink) {
    alert("Vuelva a intentarlo mas tarde");
    return;
  }

  const formContent = `
    <p>¡Hola! Aquí tienes el código QR asociado a tu boleta:</p>
    <p>Puedes usar este código QR directamente para tus propósitos.</p>


  `;

  const destinatario = correo;

  const emailData = {
    formContent,
    destinatario,
    attachment: this.qrCodeDownloadLink
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
