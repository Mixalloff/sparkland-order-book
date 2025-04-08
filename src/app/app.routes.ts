import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/order-book/order-books-container/order-books-container.component').then(m => m.OrderBooksContainerComponent) },
  { path: '**', redirectTo: '' }
];
