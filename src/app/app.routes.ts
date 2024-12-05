import { Routes } from '@angular/router';
import { NoopComponent } from './noop.component';

export const routes: Routes = [
    { path: '**', component: NoopComponent } // Fallback for unmatched routes
    // { path: '**', redirectTo: '/', pathMatch: 'full' } // Redirects all unmatched paths to the root
];
