import { Component, signal } from '@angular/core';
import { TradingPairsSelectorComponent } from '@shared/trading-pairs-selector/trading-pairs-selector.component';
import { OrderBookComponent } from '@features/order-book/order-book/order-book.component';

@Component({
  selector: 'sprk-order-books-container',
  standalone: true,
  imports: [TradingPairsSelectorComponent, OrderBookComponent],
  templateUrl: './order-books-container.component.html',
  styleUrls: ['./order-books-container.component.scss']
})
export class OrderBooksContainerComponent {
  selectedSymbols = signal<string[]>([]);
  
  onPairSelected(symbol: string): void {
    // Check if the symbol is already in the list
    if (!this.selectedSymbols().includes(symbol)) {
      this.selectedSymbols.update(symbols => [...symbols, symbol]);
    }
  }
  
  removeOrderBook(symbol: string): void {
    this.selectedSymbols.update(symbols => symbols.filter(s => s !== symbol));
  }
} 