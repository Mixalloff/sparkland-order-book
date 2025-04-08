import { Injectable, signal, computed } from '@angular/core';
import { WebSocketService } from '@services/websocket.service';
import { BinanceApiService } from '@services/binance-api.service';
import { Observable, share } from 'rxjs';
import { OrderBookLevel, OrderBookWebSocketData } from '@models/order-book.model';

/**
 * Facade service that manages all order book data operations
 * Acts as a mediator between components and services
 */
@Injectable({
  providedIn: 'root'
})
export class OrderBookFacade {
  // Manage selected symbols at the facade level
  readonly selectedSymbols = signal<string[]>([]);  
  
  // Cache streams to reuse them when multiple components request the same symbol
  private orderBookStreams = new Map<string, Observable<OrderBookWebSocketData>>();
  
  constructor(
    private webSocketService: WebSocketService,
    private binanceApiService: BinanceApiService
  ) {}

  /**
   * Add a trading pair symbol to the selected list
   */
  addSymbol(symbol: string): boolean {
    // Check if symbol is already selected
    if (this.selectedSymbols().includes(symbol)) {
      console.warn(`Symbol ${symbol} is already displayed`);
      return false;
    }

    // Add symbol to the list
    this.selectedSymbols.update(symbols => [...symbols, symbol]);
    return true;
  }

  /**
   * Remove a trading pair symbol from the selected list
   */
  removeSymbol(symbol: string): void {
    // Close the WebSocket connection
    this.closeConnection(symbol);
    
    // Remove from the list
    this.selectedSymbols.update(symbols => symbols.filter(s => s !== symbol));
  }

  /**
   * Check if a symbol is currently selected
   */
  isSymbolSelected(symbol: string): boolean {
    return this.selectedSymbols().includes(symbol);
  }

  /**
   * Clear all selected symbols and close their connections
   */
  clearAllSymbols(): void {
    // Close all connections
    this.selectedSymbols().forEach(symbol => {
      this.closeConnection(symbol);
    });
    
    // Clear the list
    this.selectedSymbols.set([]);
  }

  /**
   * Get order book data stream for a specific symbol
   * @param symbol Trading pair symbol (e.g. 'BTCUSDT')
   * @returns Observable with order book data
   */
  getOrderBookStream(symbol: string): Observable<OrderBookWebSocketData> {
    // Create or reuse cached stream
    if (!this.orderBookStreams.has(symbol)) {
      const stream$ = this.webSocketService.getOrderBookStream(symbol).pipe(
        share() // Share the stream between multiple subscribers
      );
      this.orderBookStreams.set(symbol, stream$);
    }
    
    return this.orderBookStreams.get(symbol)!;
  }

  /**
   * Close WebSocket connection for a specific symbol
   * @param symbol Trading pair symbol
   */
  closeConnection(symbol: string): void {
    this.webSocketService.closeConnection(symbol);
    this.orderBookStreams.delete(symbol);
  }

  /**
   * Get WebSocket URL for order book data
   * @param symbol Trading pair symbol
   * @returns WebSocket URL
   */
  getOrderBookWebSocketUrl(symbol: string): string {
    return this.binanceApiService.getOrderBookWebSocketUrl(symbol);
  }

  /**
   * Map raw order book level data to typed model
   */
  mapOrderLevel(level: string[]): OrderBookLevel {
    return {
      price: level[0],
      quantity: level[1],
    };
  }
} 