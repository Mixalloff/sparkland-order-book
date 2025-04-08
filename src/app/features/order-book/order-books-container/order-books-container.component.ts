import { Component, inject } from '@angular/core';
import { TradingPairsSelectorComponent } from '@shared/trading-pairs-selector/trading-pairs-selector.component';
import { OrderBookComponent } from '@features/order-book/order-book/order-book.component';
import { OrderBookFacade } from '@features/order-book/services/order-book.facade';

@Component({
  selector: 'sprk-order-books-container',
  standalone: true,
  imports: [TradingPairsSelectorComponent, OrderBookComponent],
  templateUrl: './order-books-container.component.html',
  styleUrls: ['./order-books-container.component.scss']
})
export class OrderBooksContainerComponent {
  // Use the facade's selectedSymbols
  private readonly orderBookFacade = inject(OrderBookFacade);
  
  // Expose the symbols signal from the facade for the template
  get selectedSymbols() {
    return this.orderBookFacade.selectedSymbols;
  }
  
  onPairSelected(symbol: string): void {
    // Delegate the logic to the facade
    this.orderBookFacade.addSymbol(symbol);
  }
  
  removeOrderBook(symbol: string): void {
    // Delegate the removal to the facade
    this.orderBookFacade.removeSymbol(symbol);
  }
} 