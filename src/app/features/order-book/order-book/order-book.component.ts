import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal, DestroyRef, input, output } from '@angular/core';
import { OrderBookData, OrderBookLevel, OrderBookWebSocketData } from '@models/order-book.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WebSocketService } from '@services/websocket.service';
import { LoaderComponent } from '@shared/loader/loader.component';
import { EMPTY, catchError, tap } from 'rxjs';

@Component({
  selector: 'sprk-order-book',
  standalone: true,
  imports: [LoaderComponent],
  templateUrl: './order-book.component.html',
  styleUrls: ['./order-book.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderBookComponent implements OnInit, OnDestroy {
  symbol = input.required<string>();
  remove = output<void>();
  
  orderBookData = signal<OrderBookData>({
    lastUpdateId: 0,
    bids: [],
    asks: []
  });
  
  isLoading = signal(true);
  
  private readonly webSocketService = inject(WebSocketService);
  private readonly destroyRef = inject(DestroyRef);
  
  ngOnInit(): void {
    this.connectToOrderBookStream();
  }
  
  ngOnDestroy(): void {
    this.webSocketService.closeConnection(this.symbol());
  }
  
  onRemove(): void {
    this.remove.emit();
  }
  
  private connectToOrderBookStream(): void {
    this.webSocketService.getOrderBookStream(this.symbol())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(data => this.updateOrderBook(data)),
        catchError(error => {
          console.error('WebSocket error:', error);
          this.isLoading.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }
  
  private updateOrderBook(data: OrderBookWebSocketData): void {
    this.orderBookData.update((currentData: OrderBookData) => {
      return {
        lastUpdateId: data.lastUpdateId,
        bids: data.bids.map(this.mapOrderLevel),
        asks: data.asks.map(this.mapOrderLevel)
      };
    });
    
    // After receiving the first data, set isLoading to false
    if (this.isLoading()) {
      this.isLoading.set(false);
    }
  }
  
  private mapOrderLevel(level: string[]): OrderBookLevel {
    return {
      price: level[0],
      quantity: level[1]
    };
  }
} 