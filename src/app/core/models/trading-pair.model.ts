export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
}

export interface ExchangeInfoSymbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
  isSpotTradingAllowed: boolean;
}

export interface ExchangeInfo {
  symbols: ExchangeInfoSymbol[];
} 
