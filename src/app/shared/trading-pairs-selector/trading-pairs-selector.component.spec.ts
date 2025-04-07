import { TradingPairsSelectorComponent } from './trading-pairs-selector.component';
import { BinanceApiService } from '@services/binance-api.service';
import { TradingPair } from '@models/trading-pair.model';
import { MockBuilder, MockRender, MockProvider, ngMocks } from 'ng-mocks';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

describe('TradingPairsSelectorComponent', () => {
  const mockTradingPairs: TradingPair[] = [
    { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT' },
    { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT' }
  ];

  beforeEach(() => {
    return MockBuilder(TradingPairsSelectorComponent)
      .keep(ReactiveFormsModule)
      .provide(
        MockProvider(BinanceApiService, {
          getTradingPairs: jasmine.createSpy('getTradingPairs').and.returnValue(of([]))
        })
      );
  });

  it('should create', () => {
    // Arrange & Act
    const fixture = MockRender(TradingPairsSelectorComponent);
    
    // Assert
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should load trading pairs on init', () => {
    // Arrange
    const binanceApiService = ngMocks.findInstance(BinanceApiService);
    (binanceApiService.getTradingPairs as jasmine.Spy).and.returnValue(of(mockTradingPairs));
    
    // Act
    const fixture = MockRender(`
      <sprk-trading-pairs-selector [selectedSymbols]="[]"></sprk-trading-pairs-selector>
    `);
    
    const componentEl = fixture.debugElement.query(By.directive(TradingPairsSelectorComponent));
    const component = componentEl.componentInstance;
    
    // Assert
    expect(binanceApiService.getTradingPairs).toHaveBeenCalled();
    expect(component.tradingPairs()).toEqual(mockTradingPairs);
    expect(component.isLoading()).toBeFalse();
  });

  it('should handle error when loading trading pairs', () => {
    // Arrange
    const binanceApiService = ngMocks.findInstance(BinanceApiService);
    (binanceApiService.getTradingPairs as jasmine.Spy).and.returnValue(throwError(() => new Error('Network error')));
    
    // Act
    const fixture = MockRender(`
      <sprk-trading-pairs-selector [selectedSymbols]="[]"></sprk-trading-pairs-selector>
    `);
    
    const componentEl = fixture.debugElement.query(By.directive(TradingPairsSelectorComponent));
    const component = componentEl.componentInstance;
    
    // Assert
    expect(binanceApiService.getTradingPairs).toHaveBeenCalled();
    expect(component.error()).toContain('Failed to load trading pairs');
    expect(component.isLoading()).toBeFalse();
  });

  it('should emit selected pair when addPair is called', () => {
    // Arrange
    const fixture = MockRender(`
      <sprk-trading-pairs-selector [selectedSymbols]="[]"></sprk-trading-pairs-selector>
    `);
    
    const componentEl = fixture.debugElement.query(By.directive(TradingPairsSelectorComponent));
    const component = componentEl.componentInstance;
    
    // Initialize with trading pairs
    const binanceApiService = ngMocks.findInstance(BinanceApiService);
    (binanceApiService.getTradingPairs as jasmine.Spy).and.returnValue(of(mockTradingPairs));
    fixture.detectChanges();
    
    // Set up spy on output
    const emitSpy = spyOn(component.pairSelected, 'emit');
    
    // Set value in form control
    component.selectedPairControl.setValue('BTCUSDT');
    
    // Act
    component.addPair();
    
    // Assert
    expect(emitSpy).toHaveBeenCalledWith('BTCUSDT');
    expect(component.selectedPairControl.value).toBeNull();
  });

  it('should not emit when no pair is selected', () => {
    // Arrange
    const fixture = MockRender(`
      <sprk-trading-pairs-selector [selectedSymbols]="[]"></sprk-trading-pairs-selector>
    `);
    
    const componentEl = fixture.debugElement.query(By.directive(TradingPairsSelectorComponent));
    const component = componentEl.componentInstance;
    
    const emitSpy = spyOn(component.pairSelected, 'emit');
    component.selectedPairControl.setValue(null);
    
    // Act
    component.addPair();
    
    // Assert
    expect(emitSpy).not.toHaveBeenCalled();
  });
  
  it('should filter out already selected symbols', () => {
    // Arrange
    const params = {
      selectedSymbols: ['BTCUSDT']
    };
    
    // Mock API service before rendering
    const binanceApiService = jasmine.createSpyObj('BinanceApiService', ['getTradingPairs']);
    binanceApiService.getTradingPairs.and.returnValue(of(mockTradingPairs));
    
    // Override TestBed with our own mock
    ngMocks.flushTestBed();
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TradingPairsSelectorComponent],
      providers: [{ provide: BinanceApiService, useValue: binanceApiService }]
    });
    
    // Act
    const fixture = MockRender(`
      <sprk-trading-pairs-selector [selectedSymbols]="selectedSymbols"></sprk-trading-pairs-selector>
    `, params);
    
    fixture.detectChanges();
    
    const componentEl = fixture.debugElement.query(By.directive(TradingPairsSelectorComponent));
    const component = componentEl.componentInstance;
    
    // Assert
    expect(component.availablePairs().length).toBe(1);
    expect(component.availablePairs()[0].symbol).toBe('ETHUSDT');
  });
  
  it('should show "All pairs added" message when no pairs available', () => {
    // Arrange
    const params = {
      selectedSymbols: ['BTCUSDT', 'ETHUSDT']
    };
    
    // Mock API service before rendering
    const binanceApiService = jasmine.createSpyObj('BinanceApiService', ['getTradingPairs']);
    binanceApiService.getTradingPairs.and.returnValue(of(mockTradingPairs));
    
    // Override TestBed with our own mock
    ngMocks.flushTestBed();
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TradingPairsSelectorComponent],
      providers: [{ provide: BinanceApiService, useValue: binanceApiService }]
    });
    
    // Act
    const fixture = MockRender(`
      <sprk-trading-pairs-selector [selectedSymbols]="selectedSymbols"></sprk-trading-pairs-selector>
    `, params);
    
    fixture.detectChanges();
    
    const componentEl = fixture.debugElement.query(By.directive(TradingPairsSelectorComponent));
    const component = componentEl.componentInstance;
    
    // Assert
    expect(component.availablePairs().length).toBe(0);
    expect(component.allPairsAdded()).toBeTrue();
    
    const infoElement = fixture.debugElement.query(By.css('.info'));
    expect(infoElement).toBeTruthy();
    expect(infoElement.nativeElement.textContent).toContain('All pairs added');
  });
  
  it('should hide the form group when loading and show loader', () => {
    // Arrange
    const fixture = MockRender(`
      <sprk-trading-pairs-selector [selectedSymbols]="[]"></sprk-trading-pairs-selector>
    `);
    
    const componentEl = fixture.debugElement.query(By.directive(TradingPairsSelectorComponent));
    const component = componentEl.componentInstance;
    
    // Act
    component.isLoading.set(true);
    fixture.detectChanges();
    
    // Assert
    const formGroup = fixture.debugElement.query(By.css('.form-group'));
    const loader = fixture.debugElement.query(By.css('sprk-loader'));
    expect(formGroup).toBeFalsy();
    expect(loader).toBeTruthy();
  });
  
  it('should show the form control when loading is complete and hide loader', () => {
    // Arrange
    const fixture = MockRender(`
      <sprk-trading-pairs-selector [selectedSymbols]="[]"></sprk-trading-pairs-selector>
    `);
    
    const componentEl = fixture.debugElement.query(By.directive(TradingPairsSelectorComponent));
    const component = componentEl.componentInstance;
    
    component.isLoading.set(true);
    fixture.detectChanges();
    
    // Act
    component.isLoading.set(false);
    fixture.detectChanges();
    
    // Assert
    const formGroup = fixture.debugElement.query(By.css('.form-group'));
    const loader = fixture.debugElement.query(By.css('sprk-loader'));
    expect(formGroup).toBeTruthy();
    expect(loader).toBeFalsy();
  });
  
  it('should update formSelectedValue when the selectedPairControl changes', () => {
    // Arrange
    const fixture = MockRender(`
      <sprk-trading-pairs-selector [selectedSymbols]="[]"></sprk-trading-pairs-selector>
    `);
    
    const componentEl = fixture.debugElement.query(By.directive(TradingPairsSelectorComponent));
    const component = componentEl.componentInstance;
    
    // Act
    component.selectedPairControl.setValue('BTCUSDT');
    
    // Assert
    expect(component.formSelectedValue()).toBe('BTCUSDT');
  });
});
