import { Auth } from '@angular/fire/auth';
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import {AuthStateService} from '../data-acces/auth-state.service'
import { map } from "rxjs";


export const privateGuard = (): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const authState = inject(AuthStateService);

    return authState.authState$.pipe(
      map((state) => {
        console.log(state);
        if (!state) {
          router.navigateByUrl('');
          return false;
        }

        return true;
      })
    );
  };
};

export const publicGuard = (): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const authState = inject(AuthStateService);

    return authState.authState$.pipe(
      map((state) => {
        if (state) {
          router.navigateByUrl('/app/animales');
          return false;
        }

        return true;
      })
    );
  };
};
