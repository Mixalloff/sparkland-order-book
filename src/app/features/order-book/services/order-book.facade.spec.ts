import { TestBed } from '@angular/core/testing';
import { OrderBookFacade } from './order-book.facade';
import { WebSocketService } from '@services/websocket.service';
import { BinanceApiService } from '@services/binance-api.service';
import { of } from 'rxjs';
import { OrderBookWebSocketData } from '@models/order-book.model';

describe('OrderBookFacade', () => {
  let facade: OrderBookFacade;
  let webSocketServiceMock: jasmine.SpyObj<WebSocketService>;
  let binanceApiServiceMock: jasmine.SpyObj<BinanceApiService>;

  const mockOrderBookData: OrderBookWebSocketData = {
    lastUpdateId: 123456789,
    bids: [['20000', '1.5'], ['19999', '2.5']],
    asks: [['20001', '1.0'], ['20002', '3.0']]
  };

  beforeEach(() => {
    // Arrange
    const webSocketSpy = jasmine.createSpyObj('WebSocketService', [
      'getOrderBookStream', 
      'closeConnection'
    ]);
    const binanceApiSpy = jasmine.createSpyObj('BinanceApiService', [
      'getOrderBookWebSocketUrl'
    ]);
    
    TestBed.configureTestingModule({
      providers: [
        OrderBookFacade,
        { provide: WebSocketService, useValue: webSocketSpy },
        { provide: BinanceApiService, useValue: binanceApiSpy }
      ]
    });

    facade = TestBed.inject(OrderBookFacade);
    webSocketServiceMock = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
    binanceApiServiceMock = TestBed.inject(BinanceApiService) as jasmine.SpyObj<BinanceApiService>;
    
    webSocketServiceMock.getOrderBookStream.and.returnValue(of(mockOrderBookData));
    binanceApiServiceMock.getOrderBookWebSocketUrl.and.returnValue('wss://stream.binance.com/ws/btcusdt@depth');
  });

  it('should be created', () => {
    // Assert
    expect(facade).toBeTruthy();
  });

  it('should get order book stream from WebSocketService', () => {
    // Act
    facade.getOrderBookStream('BTCUSDT');
    
    // Assert
    expect(webSocketServiceMock.getOrderBookStream).toHaveBeenCalledWith('BTCUSDT');
  });

  it('should close connection using WebSocketService', () => {
    // Act
    facade.closeConnection('BTCUSDT');
    
    // Assert
    expect(webSocketServiceMock.closeConnection).toHaveBeenCalledWith('BTCUSDT');
  });
  
  it('should add symbol to selectedSymbols', () => {
    // Act
    facade.addSymbol('BTCUSDT');
    
    // Assert
    expect(facade.selectedSymbols().length).toBe(1);
    expect(facade.selectedSymbols()[0]).toBe('BTCUSDT');
  });
  
  it('should not add duplicate symbols', () => {
    // Arrange
    facade.addSymbol('BTCUSDT');
    
    // Act
    const result = facade.addSymbol('BTCUSDT');
    
    // Assert
    expect(result).toBeFalse();
    expect(facade.selectedSymbols().length).toBe(1);
  });
  
  it('should remove symbol and close connection', () => {
    // Arrange
    facade.addSymbol('BTCUSDT');
    
    // Act
    facade.removeSymbol('BTCUSDT');
    
    // Assert
    expect(webSocketServiceMock.closeConnection).toHaveBeenCalledWith('BTCUSDT');
    expect(facade.selectedSymbols().length).toBe(0);
  });
  
  it('should map order level correctly', () => {
    // Act
    const result = facade.mapOrderLevel(['100.50', '2.5']);
    
    // Assert
    expect(result).toEqual({
      price: '100.50',
      quantity: '2.5'
    });
  });

  it('should clear all symbols and close connections', () => {
    // Arrange
    facade.addSymbol('BTCUSDT');
    facade.addSymbol('ETHUSDT');
    
    // Act
    facade.clearAllSymbols();
    
    // Assert
    expect(webSocketServiceMock.closeConnection).toHaveBeenCalledWith('BTCUSDT');
    expect(webSocketServiceMock.closeConnection).toHaveBeenCalledWith('ETHUSDT');
    expect(facade.selectedSymbols().length).toBe(0);
  });

  it('should check if a symbol is selected', () => {
    // Arrange
    facade.addSymbol('BTCUSDT');
    
    // Act & Assert
    expect(facade.isSymbolSelected('BTCUSDT')).toBeTrue();
    expect(facade.isSymbolSelected('ETHUSDT')).toBeFalse();
  });
}); 
