import { Component, inject, OnInit } from '@angular/core';
import { RouterLink ,Router, RouterModule} from '@angular/router';
import {AuthStateService} from '../../data-acces/auth-state.service'

@Component({
  selector: 'app-base',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './base.component.html',
  styles: ``
})
export class BaseComponent {


  private _authState = inject(AuthStateService);
  private _router = inject(Router);

  async logOut(){
    await this._authState.logOut();
    this._router.navigate(['']);
  }

}
