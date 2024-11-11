import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {initializeApp} from 'firebase/app';
import {provideFirestore, getFirestore} from '@angular/fire/firestore';
import {provideFirebaseApp} from '@angular/fire/app';
import {provideNativeDateAdapter} from '@angular/material/core';
const firebaseConfig = {
  apiKey: "AIzaSyAYu2kpJTir6JFOUHepriNpCQi16Nm4Wuo",
  authDomain: "plan-n-go.firebaseapp.com",
  projectId: "plan-n-go",
  storageBucket: "plan-n-go.firebasestorage.app",
  messagingSenderId: "209864777994",
  appId: "1:209864777994:web:7d5b29b472454064c11af3",
  measurementId: "G-KNHJ3NWC5W"
};

const app = initializeApp(firebaseConfig);

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({eventCoalescing: true}), provideRouter(routes), provideAnimationsAsync(), provideFirebaseApp(() => app),
    provideFirestore(() => getFirestore(app)), provideNativeDateAdapter()]
};
