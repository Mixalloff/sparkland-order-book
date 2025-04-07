import { Component, OnInit, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BinanceApiService } from '@services/binance-api.service';
import { TradingPair } from '@models/trading-pair.model';
import { catchError, finalize, of, tap } from 'rxjs';
import { LoaderComponent } from '@shared/loader/loader.component';

@Component({
  selector: 'sprk-trading-pairs-selector',
  templateUrl: './trading-pairs-selector.component.html',
  styleUrls: ['./trading-pairs-selector.component.scss'],
  imports: [ReactiveFormsModule, LoaderComponent],
  standalone: true,
})
export class TradingPairsSelectorComponent implements OnInit {
  selectedSymbols = input<string[]>([]);
  pairSelected = output<string>();
  
  // State signals
  tradingPairs = signal<TradingPair[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  formSelectedValue = signal<string | null>(null);
  
  // Computed values
  availablePairs = computed(() => {
    return this.tradingPairs().filter(
      pair => !this.selectedSymbols().includes(pair.symbol)
    );
  });
  
  // All pairs added signal
  allPairsAdded = computed(() => 
    this.availablePairs().length === 0 && !this.isLoading() && !this.error()
  );
    
  // Form validity signal
  isFormValid = computed(() => {
    return this.selectedPairControl.valid
      && !!this.formSelectedValue()
      && !this.isLoading();
  });
  

  selectedPairControl = new FormControl<string | null>(null);

  private readonly binanceApiService = inject(BinanceApiService);
  
  constructor() {
    // React to changes in isLoading with effect
    effect(() => {
      const isLoadingValue = this.isLoading();
      
      if (isLoadingValue) {
        this.selectedPairControl.disable();
      } else {
        this.selectedPairControl.enable();
      }
    });
  }
  
  ngOnInit(): void {
    this.loadTradingPairs();
    
    // Subscribe to form control value changes
    this.selectedPairControl.valueChanges
      .pipe(
        tap(value => this.formSelectedValue.set(value || '')),
        catchError(error => {
          console.error('Form control value changes error:', error);
          return of(null);
        })
      )
      .subscribe();
  }
  
  addPair(): void {
    const selectedPair = this.selectedPairControl.value;
    
    if (selectedPair) {
      this.pairSelected.emit(selectedPair);
      this.selectedPairControl.reset();
      this.formSelectedValue.set(null);
    }
  }
  
  private loadTradingPairs(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.binanceApiService.getTradingPairs()
      .pipe(
        tap(pairs => this.tradingPairs.set(pairs)),
        catchError(error => {
          this.error.set('Failed to load trading pairs. Please try again later.');
          console.error('Failed to load trading pairs:', error);
          return of([]);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }
}
