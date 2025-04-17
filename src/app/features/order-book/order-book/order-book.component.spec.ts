import { OrderBookComponent } from './order-book.component';
import { OrderBookFacade } from '@features/order-book/services/order-book.facade';
import { of } from 'rxjs';
import { OrderBookWebSocketData } from '@models/order-book.model';
import { MockBuilder, MockRender, MockProvider, ngMocks, MockedComponentFixture } from 'ng-mocks';

describe('OrderBookComponent', () => {
  let component: OrderBookComponent;
  let fixture: MockedComponentFixture<OrderBookComponent, { symbol: string }>;
  let orderBookFacadeMock: jasmine.SpyObj<OrderBookFacade>;

  const mockOrderBookData: OrderBookWebSocketData = {
    lastUpdateId: 123456789,
    bids: [['20000', '1.5'], ['19999', '2.5']],
    asks: [['20001', '1.0'], ['20002', '3.0']]
  };

  beforeEach(() => {
    return MockBuilder(OrderBookComponent)
      .provide(
        MockProvider(OrderBookFacade, {
          getOrderBookStream: jasmine.createSpy('getOrderBookStream').and.returnValue(of(mockOrderBookData)),
          closeConnection: jasmine.createSpy('closeConnection'),
          mapOrderLevel: jasmine.createSpy('mapOrderLevel').and.callFake((level) => ({
            price: level[0],
            quantity: level[1]
          }))
        })
      );
  });

  beforeEach(() => {
    // Arrange
    fixture = MockRender(OrderBookComponent, {
      symbol: 'BTCUSDT',
    });
    component = fixture.point.componentInstance;
    orderBookFacadeMock = ngMocks.findInstance(OrderBookFacade) as jasmine.SpyObj<OrderBookFacade>;
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

  it('should call OrderBookFacade.getOrderBookStream with correct symbol', () => {
    // Act
    component.ngOnInit();
    
    // Assert
    expect(orderBookFacadeMock.getOrderBookStream).toHaveBeenCalledWith('BTCUSDT');
  });

  it('should close WebSocket connection on component destroy', () => {
    // Act
    component.ngOnDestroy();
    
    // Assert
    expect(orderBookFacadeMock.closeConnection).toHaveBeenCalledWith('BTCUSDT');
  });

  it('should display error message when error state is true', () => {
    // Arrange
    component.isError.set(true);
    component.isLoading.set(false);
    
    // Act
    fixture.detectChanges();
    
    // Assert
    const errorContainer = ngMocks.find(fixture, '.error-container');
    expect(errorContainer).toBeTruthy();
    
    const reconnectButton = ngMocks.find(errorContainer, '.error-container__reconnect-btn');
    expect(reconnectButton).toBeTruthy();
  });

  it('should attempt reconnection when retry button is clicked', () => {
    // Arrange
    component.isError.set(true);
    fixture.detectChanges();
    
    spyOn(component, 'onReconnect').and.callThrough();
    
    // Act
    const reconnectButton = ngMocks.find(fixture, '.error-container__reconnect-btn');
    ngMocks.click(reconnectButton);
    
    // Assert
    expect(component.onReconnect).toHaveBeenCalled();
  });

  it('should clear error state after successful reconnection', () => {
    // Arrange
    component.isError.set(true);
    fixture.detectChanges();
    
    // Act
    component.onReconnect();
    fixture.detectChanges();
    
    // Assert
    expect(component.isError()).toBeFalse();
    expect(() => ngMocks.find(fixture, '.error-container')).toThrow();
    
    const bidsElements = ngMocks.findAll(fixture, '.bids .table-row');
    expect(bidsElements.length).toBeGreaterThan(0);
  });

  it('should emit remove event when remove button is clicked', () => {
    // Arrange
    spyOn(component.remove, 'emit');
    fixture.detectChanges();
    
    // Act
    const removeButton = ngMocks.find(fixture, '.remove-btn');
    ngMocks.click(removeButton);
    
    // Assert
    expect(component.remove.emit).toHaveBeenCalled();
  });
}); 