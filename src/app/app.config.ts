import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAnalytics } from "firebase/analytics";
import { getStorage, provideStorage } from '@angular/fire/storage'; // Importa Storage
import { provideHttpClient } from '@angular/common/http'; // Importa provideHttpClient

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() =>
    initializeApp({
      apiKey: "AIzaSyCgSN2tQRpaPP-E11zqyJ7FHEsjqsqjE1o",
      authDomain: "appzoolife.firebaseapp.com",
      projectId: "appzoolife",
      storageBucket: "appzoolife.appspot.com",
      messagingSenderId: "8229883615",
      appId: "1:8229883615:web:4f905051866514b68a636a",
      measurementId: "G-J0ZQJR6W0K"
    })),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
      provideStorage(() => getStorage()),
    provideHttpClient()]

};
