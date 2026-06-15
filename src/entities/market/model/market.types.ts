export type MarketStatus =
  | "PENDING"
  | "ACTIVE"
  | "CLOSED"
  | "DATA_PENDING"
  | "SETTLEMENT_IN_PROGRESS"
  | "SETTLED"
  | "VOIDED";

export type MarketListParams = {
  page?: number;
  size?: number;
  status?: MarketStatus;
  keyword?: string;
};

export type MarketPriceHistoryParams = {
  page?: number;
  size?: number;
  optionId?: number;
};

export type MarketListResponse = {
  content: MarketSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type MarketSummary = {
  marketId: number;
  title: string;
  status: MarketStatus;
  closeAt: string;
  totalPoolAmount: string;
  options: MarketOption[];
};

export type MarketOption = {
  optionId: number;
  content: string;
  currentPrice: string;
  realPoolAmount?: string;
  virtualPoolAmount?: string;
};

export type MarketDetail = MarketSummary & {
  description?: string;
  resultAnnounceAt?: string;
};

export type MarketPriceHistoryResponse = {
  content: MarketPriceHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type MarketPriceHistoryItem = {
  historyId: number;
  marketId: number;
  optionId: number;
  optionContent: string;
  predictionId: number;
  eventType: string;
  priceBefore: string;
  priceAfter: string;
  priceChangeRate: string;
  realPoolBefore: string;
  realPoolAfter: string;
  virtualPoolAmount: string;
  contractQuantityBefore: string;
  contractQuantityAfter: string;
  createdAt: string;
};
