import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { OrderBookWebSocketData } from '@models/order-book.model';
import { BinanceApiService } from '@services/binance-api.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private readonly binanceApiService = inject(BinanceApiService);
  private connections: Map<string, WebSocketSubject<OrderBookWebSocketData>> = new Map();

  getOrderBookStream(symbol: string): Observable<OrderBookWebSocketData> {
    // Check if there is already a connection for this symbol
    let connection = this.connections.get(symbol);
    
    if (!connection) {
      const url = this.binanceApiService.getOrderBookWebSocketUrl(symbol);
      connection = webSocket<OrderBookWebSocketData>(url);
      this.connections.set(symbol, connection);
    }
    
    return connection.asObservable();
  }

  closeConnection(symbol: string): void {
    const connection = this.connections.get(symbol);
    if (connection) {
      connection.complete();
      this.connections.delete(symbol);
    }
  }

  closeAllConnections(): void {
    this.connections.forEach(connection => connection.complete());
    this.connections.clear();
  }
} 