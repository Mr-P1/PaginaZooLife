import { Component,inject } from '@angular/core';
import { ReactiveFormsModule,FormBuilder, FormControl,Validators} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServicioLoginService } from '../../servicio/servicio-login.service';
import { Router, RouterLink } from '@angular/router';


// Sweetalert2
import Swal from 'sweetalert2';



interface FormSignin{
  email:FormControl<string  >;
  contraseña:FormControl<string >;
}


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private _formBuilder = inject(FormBuilder);
  private _authService = inject(ServicioLoginService)
  private _router = inject(Router);


  form = this._formBuilder.group(
    {
      email:this._formBuilder.control('',[Validators.required,Validators.email]),
      password:this._formBuilder.control('',[Validators.required, Validators.minLength(5)])

    }
  )

  errorMessage: string | null = null;


  async submit() {

    if (this.form.invalid) return;

    try {
      const { email, password } = this.form.value;

      if (!email || !password) return;

      await this._authService.logearse({ email, password });

      Swal.fire({
        icon: "success",
        title: "Sesion iniciada",
        showConfirmButton: false,
        timer: 3000, // Cambiar el tiempo
        position: "center", // Centra la alerta
        backdrop: 'rgba(0,0,0,0.5)', // Fondo oscuro semi-transparente
      });

      this._router.navigate(['/app/animales']);
    } catch (error) {

      Swal.fire({
        title: "Error",
        text: "Usuario no encontrado",
        icon: "error",
        backdrop: 'rgba(0, 0, 0, 0.8)', // Aumenta la opacidad
      });

    }



  }

}
