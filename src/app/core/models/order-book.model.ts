export interface OrderBookLevel {
  price: string;
  quantity: string;
}

export interface OrderBookData {
  lastUpdateId: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface OrderBookWebSocketData {
  lastUpdateId: number;
  bids: string[][];
  asks: string[][];
} 