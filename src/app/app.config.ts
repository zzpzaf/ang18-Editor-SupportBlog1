import { ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { MARKED_OPTIONS, provideMarkdown } from 'ngx-markdown';
import { provideClientHydration } from '@angular/platform-browser';        

import { QuillModule } from 'ngx-quill';
import { isPlatformBrowser } from '@angular/common';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideMarkdown({
      markedOptions: {
        provide: MARKED_OPTIONS,
        useValue: {
          gfm: true,
          breaks: false,
          pedantic: false,
        },
      },
    }), 
    {
      provide: QuillModule.forRoot(),
      multi: true,
      useFactory: (platformId: Object) => isPlatformBrowser(platformId) ? QuillModule.forRoot().providers : [],
      deps: []
    },  
    provideClientHydration(),
  ],
};



 