import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ExchangeInfo, ExchangeInfoSymbol, TradingPair } from '@models/trading-pair.model';

@Injectable({
  providedIn: 'root'
})
export class BinanceApiService {
  private readonly http = inject(HttpClient);
  private readonly baseApiUrl = 'https://api.binance.com/api/v3';
  private readonly webSocketBaseUrl = 'wss://stream.binance.com:9443/ws';
  
  getTradingPairs(): Observable<TradingPair[]> {
    return this.http.get<ExchangeInfo>(`${this.baseApiUrl}/exchangeInfo`)
      .pipe(
        map(exchangeInfo => {
          return exchangeInfo.symbols
            .filter(this.isSymbolAllowed)
            .map(this.symbolMapper);
        })
      );
  }
  
  getOrderBookWebSocketUrl(symbol: string, depth: number = 5): string {
    return `${this.webSocketBaseUrl}/${symbol.toLowerCase()}@depth${depth}`;
  }

  private isSymbolAllowed(symbol: ExchangeInfoSymbol): boolean {
    // Only for pairs with USDT or USD as quote asset
    const availablePairsQuoteAssets: string[] = ['USDT', 'USD'];
    return symbol.isSpotTradingAllowed
      && availablePairsQuoteAssets.includes(symbol.quoteAsset);
  }

  private symbolMapper(symbol: ExchangeInfoSymbol): TradingPair {
    return {
      symbol: symbol.symbol,
      baseAsset: symbol.baseAsset,
      quoteAsset: symbol.quoteAsset,
    };
  }
} 