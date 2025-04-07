import { TestBed } from '@angular/core/testing';
import { WebSocketService } from '@services/websocket.service';
import { BinanceApiService } from '@services/binance-api.service';
import { Observable, of } from 'rxjs';

// Create mock for webSocket
class MockWebSocketSubject {
  constructor(public url: string) {}
  
  asObservable(): Observable<any> {
    return of({ data: 'test' });
  }
  
  complete(): void {}
}

describe('WebSocketService', () => {
  let service: WebSocketService;
  let binanceApiServiceMock: jasmine.SpyObj<BinanceApiService>;
  let mockWebSocketFactory: jasmine.Spy;
  
  beforeEach(() => {
    // Arrange
    binanceApiServiceMock = jasmine.createSpyObj('BinanceApiService', ['getOrderBookWebSocketUrl']);
    binanceApiServiceMock.getOrderBookWebSocketUrl.and.returnValue('wss://test-url');
    
    // Factory for creating mock WebSocketSubject
    mockWebSocketFactory = jasmine.createSpy('webSocketFactory').and.callFake(
      (url: string) => new MockWebSocketSubject(url)
    );
    
    TestBed.configureTestingModule({
      providers: [
        WebSocketService,
        { provide: BinanceApiService, useValue: binanceApiServiceMock }
      ]
    });
    
    service = TestBed.inject(WebSocketService);
    
    // @ts-ignore
    service['webSocketFactory'] = mockWebSocketFactory;
  });
  
  it('should be created', () => {
    // Assert
    expect(service).toBeTruthy();
  });
  
  it('should get WebSocket URL from BinanceApiService', () => {
    // Act
    service.getOrderBookStream('BTCUSDT');
    
    // Assert
    expect(binanceApiServiceMock.getOrderBookWebSocketUrl).toHaveBeenCalledWith('BTCUSDT');
  });
  
  it('should reuse existing connection for same symbol', () => {
    // Act
    service.getOrderBookStream('BTCUSDT');
    service.getOrderBookStream('BTCUSDT');
    service.getOrderBookStream('BTCUSDT');
    
    // Assert
    expect(mockWebSocketFactory).toHaveBeenCalledTimes(1);
  });
  
  it('should create new connections for different symbols', () => {
    // Arrange
    service.getOrderBookStream('BTCUSDT');
    binanceApiServiceMock.getOrderBookWebSocketUrl.and.returnValue('wss://test-url-2');
    
    // Act
    service.getOrderBookStream('ETHUSDT');
    
    // Assert
    expect(mockWebSocketFactory).toHaveBeenCalledTimes(2);
  });
  
  it('should close connection when requested', () => {
    // Arrange
    const connection = service.getOrderBookStream('BTCUSDT');
    spyOn(MockWebSocketSubject.prototype, 'complete');
    
    // Act
    service.closeConnection('BTCUSDT');
    
    // Assert
    expect(MockWebSocketSubject.prototype.complete).toHaveBeenCalled();
  });
}); 