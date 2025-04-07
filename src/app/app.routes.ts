import { Routes } from '@angular/router';
import { OrderBooksContainerComponent } from './features/order-book/order-books-container/order-books-container.component';

export const routes: Routes = [
  { path: '', component: OrderBooksContainerComponent },
  { path: '**', redirectTo: '' }
];
