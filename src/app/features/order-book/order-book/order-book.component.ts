import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal, DestroyRef, input, output } from '@angular/core';
import { OrderBookData, OrderBookWebSocketData } from '@models/order-book.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoaderComponent } from '@shared/loader/loader.component';
import { EMPTY, Subscription, catchError, finalize, retry, take, tap, timer } from 'rxjs';
import { OrderBookFacade } from '@features/order-book/services/order-book.facade';

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
  isError = signal(false);

  private lastMessageTime!: number;
  private pingTimeoutSubscription!: Subscription;
  
  private readonly orderBookFacade = inject(OrderBookFacade);
  private readonly destroyRef = inject(DestroyRef);
  
  ngOnInit(): void {
    this.connectToOrderBookStream();
  }
  
  ngOnDestroy(): void {
    this.disconnectFromOrderBookStream();
  }
  
  onRemove(): void {
    this.remove.emit();
  }

  onReconnect(): void {
    this.connectToOrderBookStream();
  }
  
  private connectToOrderBookStream(): void {
    const RETRY_TIMES = 5;
    const RETRY_DELAY = 2000;

    const stream$ = this.orderBookFacade.getOrderBookStream(this.symbol());
    this.isError.set(false);
    this.isLoading.set(true);

    // Set isLoading to false after the first data is received and start checking for connection timeout
    stream$.pipe(
      takeUntilDestroyed(this.destroyRef),
      take(1),
      tap(() => this.createConnectionTimeoutSubscribe()),
      tap(() => this.isLoading.set(false)),
    ).subscribe();

    stream$.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(data => this.updateOrderBook(data)),
      tap(() => this.lastMessageTime = Date.now()),
      retry({ count: RETRY_TIMES, delay: RETRY_DELAY }),
      catchError(error => {
        console.error('Error connecting to order book stream:', error);
        this.isError.set(true);
        return EMPTY;
      }),
      finalize(() => this.isLoading.set(false)),
    ).subscribe();
  }

  private createConnectionTimeoutSubscribe(): void {
    const PING_INTERVAL = 2000;
    const PING_TIMEOUT = 10_000;
    this.cleanupTimerSubscription();
    this.lastMessageTime = Date.now();

    this.pingTimeoutSubscription = timer(0, PING_INTERVAL)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          const now = Date.now();
          if (now - this.lastMessageTime > PING_TIMEOUT) {
            console.warn('No data timeout — possible disconnection');
            this.isError.set(true);
            this.cleanupTimerSubscription();
          }
        })
      )
      .subscribe();
  }

  private cleanupTimerSubscription(): void {
    this.pingTimeoutSubscription?.unsubscribe();
  }
  
  private disconnectFromOrderBookStream(): void {
    this.orderBookFacade.closeConnection(this.symbol());
  }
  
  private updateOrderBook(data: OrderBookWebSocketData): void {
    // Reset error state if data is received
    if (data && this.isError()) {
      this.isError.set(false);
    }

    this.orderBookData.update(() => {
      return {
        lastUpdateId: data.lastUpdateId,
        bids: data.bids.map(this.orderBookFacade.mapOrderLevel),
        asks: data.asks.map(this.orderBookFacade.mapOrderLevel),
      };
    });
  }
} 