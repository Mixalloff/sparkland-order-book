import { OrderBooksContainerComponent } from './order-books-container.component';
import { TradingPairsSelectorComponent } from '@shared/trading-pairs-selector/trading-pairs-selector.component';
import { OrderBookComponent } from '@features/order-book/order-book/order-book.component';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

describe('OrderBooksContainerComponent', () => {
  beforeEach(() => {
    return MockBuilder(OrderBooksContainerComponent)
      .mock(TradingPairsSelectorComponent)
      .mock(OrderBookComponent);
  });

  it('should create', () => {
    // Arrange & Act
    const fixture = MockRender(OrderBooksContainerComponent);
    
    // Assert
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should add a symbol when pairSelected is emitted', () => {
    // Arrange
    const fixture = MockRender(OrderBooksContainerComponent);
    const component = fixture.point.componentInstance;
    const selectorEl = ngMocks.find(TradingPairsSelectorComponent);
    const pairSelector = ngMocks.get(selectorEl, TradingPairsSelectorComponent);
    
    // Act
    pairSelector.pairSelected.emit('BTCUSDT');
    
    // Assert
    expect(component.selectedSymbols().length).toBe(1);
    expect(component.selectedSymbols()[0]).toBe('BTCUSDT');
  });

  it('should not add duplicate symbols', () => {
    // Arrange
    const fixture = MockRender(OrderBooksContainerComponent);
    const component = fixture.point.componentInstance;
    
    // Act
    component.onPairSelected('BTCUSDT');
    component.onPairSelected('BTCUSDT');
    
    // Assert
    expect(component.selectedSymbols().length).toBe(1);
    expect(component.selectedSymbols()[0]).toBe('BTCUSDT');
  });

  it('should remove a symbol when removeOrderBook is called', () => {
    // Arrange
    const fixture = MockRender(OrderBooksContainerComponent);
    const component = fixture.point.componentInstance;
    component.onPairSelected('BTCUSDT');
    component.onPairSelected('ETHUSDT');
    
    // Act
    component.removeOrderBook('BTCUSDT');
    
    // Assert
    expect(component.selectedSymbols().length).toBe(1);
    expect(component.selectedSymbols()[0]).toBe('ETHUSDT');
  });
  
  it('should pass selectedSymbols to trading-pairs-selector as input', () => {
    // Arrange
    const fixture = MockRender(OrderBooksContainerComponent);
    const component = fixture.point.componentInstance;
    component.onPairSelected('BTCUSDT');
    
    // Act
    fixture.detectChanges();
    
    // Assert
    const selectorEl = ngMocks.find(TradingPairsSelectorComponent);
    const inputValue = ngMocks.input(selectorEl, 'selectedSymbols');
    expect(inputValue).toEqual(component.selectedSymbols());
  });
  
  it('should render order-book component for each selected symbol', () => {
    // Arrange
    const fixture = MockRender(OrderBooksContainerComponent);
    const component = fixture.point.componentInstance;
    
    // Act
    component.onPairSelected('BTCUSDT');
    component.onPairSelected('ETHUSDT');
    fixture.detectChanges();
    
    // Assert
    const orderBookElements = ngMocks.findAll(OrderBookComponent);
    expect(orderBookElements.length).toBe(2);
    
    // Verify inputs passed to the order books
    const firstOrderBook = ngMocks.input(orderBookElements[0], 'symbol');
    const secondOrderBook = ngMocks.input(orderBookElements[1], 'symbol');
    expect(firstOrderBook).toBe('BTCUSDT');
    expect(secondOrderBook).toBe('ETHUSDT');
  });
  
  it('should remove order book when remove event is emitted', () => {
    // Arrange
    const fixture = MockRender(OrderBooksContainerComponent);
    const component = fixture.point.componentInstance;
    component.onPairSelected('BTCUSDT');
    fixture.detectChanges();
    
    const orderBookEl = ngMocks.find(OrderBookComponent);
    const orderBook = ngMocks.get(orderBookEl, OrderBookComponent);
    
    // Act
    orderBook.remove.emit();
    
    // Assert
    expect(component.selectedSymbols().length).toBe(0);
  });
}); 