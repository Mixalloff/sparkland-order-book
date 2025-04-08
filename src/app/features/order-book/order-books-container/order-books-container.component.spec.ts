import { OrderBooksContainerComponent } from './order-books-container.component';
import { MockBuilder, MockRender, ngMocks, MockedComponentFixture } from 'ng-mocks';
import { OrderBookComponent } from '@features/order-book/order-book/order-book.component';
import { OrderBookFacade } from '@features/order-book/services/order-book.facade';
import { TradingPairsSelectorComponent } from '@shared/trading-pairs-selector/trading-pairs-selector.component';
import { signal } from '@angular/core';

describe('OrderBooksContainerComponent', () => {
  let component: OrderBooksContainerComponent;
  let fixture: MockedComponentFixture<OrderBooksContainerComponent>;
  let orderBookFacadeMock: jasmine.SpyObj<OrderBookFacade>;

  beforeEach(() => {
    // Arrange
    orderBookFacadeMock = jasmine.createSpyObj('OrderBookFacade', 
      ['addSymbol', 'removeSymbol'],
      {
        selectedSymbols: signal<string[]>([])
      }
    );

    return MockBuilder(OrderBooksContainerComponent)
      .mock(OrderBookComponent)
      .mock(TradingPairsSelectorComponent)
      .provide({
        provide: OrderBookFacade,
        useValue: orderBookFacadeMock
      });
  });

  beforeEach(() => {
    // Arrange
    fixture = MockRender(OrderBooksContainerComponent);
    component = fixture.point.componentInstance;
  });

  it('should create the component', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  it('should add a symbol when onPairSelected is called', () => {
    // Arrange
    const symbol = 'BTCUSDT';
    
    // Act
    component.onPairSelected(symbol);
    
    // Assert
    expect(orderBookFacadeMock.addSymbol).toHaveBeenCalledWith(symbol);
  });

  it('should remove a symbol when removeOrderBook is called', () => {
    // Arrange
    const symbolToRemove = 'BTCUSDT';
    
    // Act
    component.removeOrderBook(symbolToRemove);
    
    // Assert
    expect(orderBookFacadeMock.removeSymbol).toHaveBeenCalledWith(symbolToRemove);
  });

  it('should display OrderBook components for each selected symbol', () => {
    // Arrange
    orderBookFacadeMock.selectedSymbols.set(['BTCUSDT', 'ETHUSDT']);
    
    // Act
    fixture.detectChanges();
    
    // Assert
    const orderBookElements = ngMocks.findAll(OrderBookComponent);
    expect(orderBookElements.length).toBe(2);
    
    expect(ngMocks.input(orderBookElements[0], 'symbol')).toBe('BTCUSDT');
    expect(ngMocks.input(orderBookElements[1], 'symbol')).toBe('ETHUSDT');
  });

  it('should call removeOrderBook when remove event is emitted from OrderBook component', () => {
    // Arrange
    orderBookFacadeMock.selectedSymbols.set(['BTCUSDT']);
    fixture.detectChanges();
    
    spyOn(component, 'removeOrderBook');
    
    // Act
    const orderBookElement = ngMocks.find(OrderBookComponent);
    ngMocks.output(orderBookElement, 'remove').emit();
    
    // Assert
    expect(component.removeOrderBook).toHaveBeenCalledWith('BTCUSDT');
  });

  it('should display a message when there are no selected symbols', () => {
    // Arrange
    orderBookFacadeMock.selectedSymbols.set([]);
    
    // Act
    fixture.detectChanges();
    
    // Assert
    expect(() => ngMocks.find(OrderBookComponent)).toThrow();
    const emptyMessage = ngMocks.find(fixture, '.no-books');
    expect(emptyMessage).toBeTruthy();
  });

  it('should handle pairSelected event from TradingPairsSelector', () => {
    // Arrange
    const symbol = 'ETHUSDT';
    spyOn(component, 'onPairSelected');
    
    // Act
    const selectorElement = ngMocks.find(TradingPairsSelectorComponent);
    ngMocks.output(selectorElement, 'pairSelected').emit(symbol);
    
    // Assert
    expect(component.onPairSelected).toHaveBeenCalledWith(symbol);
  });
}); 