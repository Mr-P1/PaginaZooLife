import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthStateService } from '../../data-acces/auth-state.service';


// Sweetalert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-base',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './base.component.html',
  styles: ``,
})
export class BaseComponent {
  private _authState = inject(AuthStateService);
  private _router = inject(Router);




  async logOut() {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se cerrará la sesión actual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Cerrar sesión',
      cancelButtonText: 'Volver',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    });

    if (result.isConfirmed) {
      try {
        await this._authState.logOut();
        this._router.navigate(['']);
      } catch {}
    }
  }
}
