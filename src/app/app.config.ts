import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AUTH_API_BASE_URL, DATA_API_BASE_URL } from './core/config/api';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimations(),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideRouter(routes),
    { provide: AUTH_API_BASE_URL, useValue: environment.authApiBaseUrl },
    { provide: DATA_API_BASE_URL, useValue: environment.dataApiBaseUrl },
  ],
};
