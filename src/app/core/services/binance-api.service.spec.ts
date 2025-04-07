import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BinanceApiService } from '@services/binance-api.service';
import { ExchangeInfo } from '@models/trading-pair.model';
import { tap } from 'rxjs';

describe('BinanceApiService', () => {
  let service: BinanceApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BinanceApiService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(BinanceApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    // Assert
    expect(service).toBeTruthy();
  });

  it('should fetch and filter trading pairs properly', () => {
    // Arrange
    const mockExchangeInfo: ExchangeInfo = {
      symbols: [
        { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', status: 'TRADING', isSpotTradingAllowed: true },
        { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', status: 'TRADING', isSpotTradingAllowed: true },
        { symbol: 'BTCETH', baseAsset: 'BTC', quoteAsset: 'ETH', status: 'TRADING', isSpotTradingAllowed: true },
        { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', status: 'TRADING', isSpotTradingAllowed: false },
      ]
    };

    // Act
    service.getTradingPairs()
      .pipe(
        tap(pairs => {
          expect(pairs.length).toBe(2);
          expect(pairs[0].symbol).toBe('BTCUSDT');
          expect(pairs[1].symbol).toBe('ETHUSDT');
        })
      )
      .subscribe();

    // Assert
    const req = httpMock.expectOne('https://api.binance.com/api/v3/exchangeInfo');
    expect(req.request.method).toBe('GET');
    req.flush(mockExchangeInfo);
  });

  it('should return the correct WebSocket URL', () => {
    // Arrange
    const symbol = 'BTCUSDT';
    const depth = 3;
    
    // Act
    const url = service.getOrderBookWebSocketUrl(symbol, depth);
    
    // Assert
    expect(url).toBe(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth${depth}`);
  });
}); 