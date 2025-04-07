import { OrderBookComponent } from './order-book.component';
import { WebSocketService } from '@services/websocket.service';
import { of } from 'rxjs';
import { OrderBookWebSocketData } from '@models/order-book.model';
import { MockBuilder, MockRender, MockProvider, ngMocks, MockedComponentFixture } from 'ng-mocks';

describe('OrderBookComponent', () => {
  let component: OrderBookComponent;
  let fixture: MockedComponentFixture<OrderBookComponent, { symbol: string }>;
  let webSocketServiceMock: jasmine.SpyObj<WebSocketService>;

  const mockOrderBookData: OrderBookWebSocketData = {
    lastUpdateId: 123456789,
    bids: [['20000', '1.5'], ['19999', '2.5']],
    asks: [['20001', '1.0'], ['20002', '3.0']]
  };

  beforeEach(() => {
    return MockBuilder(OrderBookComponent)
      .provide(
        MockProvider(WebSocketService, {
          getOrderBookStream: jasmine.createSpy('getOrderBookStream').and.returnValue(of(mockOrderBookData)),
          closeConnection: jasmine.createSpy('closeConnection')
        })
      );
  });

  beforeEach(() => {
    // Arrange
    fixture = MockRender(OrderBookComponent, {
      symbol: 'BTCUSDT',
    });
    component = fixture.point.componentInstance;
    webSocketServiceMock = ngMocks.findInstance(WebSocketService) as jasmine.SpyObj<WebSocketService>;
  });

  it('should create', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  it('should show loading indicator initially', () => {
    // Arrange
    component.isLoading.set(true);
    
    // Act
    fixture.detectChanges();
    
    // Assert
    const loadingElement = ngMocks.find(fixture, 'sprk-loader');
    expect(loadingElement).toBeTruthy();
  });

  it('should hide loading indicator after receiving data', () => {
    // Arrange
    component.ngOnInit();
    
    // Act
    fixture.detectChanges();
    
    // Assert
    expect(component.isLoading()).toBeFalse();
    expect(() => ngMocks.find(fixture, 'sprk-loader')).toThrow();
  });

  it('should display bids and asks correctly', () => {
    // Arrange
    component.ngOnInit();
    component.isLoading.set(false);
    
    // Act
    fixture.detectChanges();
    
    // Assert
    const bidsElements = ngMocks.findAll(fixture, '.bids .table-row');
    const asksElements = ngMocks.findAll(fixture, '.asks .table-row');
    
    expect(bidsElements.length).toBe(2);
    expect(asksElements.length).toBe(2);
    
    // Check that prices are displayed correctly
    expect(ngMocks.formatText(ngMocks.find(bidsElements[0], '.price'))).toContain('20000');
    expect(ngMocks.formatText(ngMocks.find(asksElements[0], '.price'))).toContain('20001');
  });

  it('should call WebSocketService.getOrderBookStream with correct symbol', () => {
    // Act
    component.ngOnInit();
    
    // Assert
    expect(webSocketServiceMock.getOrderBookStream).toHaveBeenCalledWith('BTCUSDT');
  });

  it('should close WebSocket connection on component destroy', () => {
    // Act
    component.ngOnDestroy();
    
    // Assert
    expect(webSocketServiceMock.closeConnection).toHaveBeenCalledWith('BTCUSDT');
  });
}); 