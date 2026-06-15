import { useMutation } from "@tanstack/react-query";

import { getMarketPredictionQuote } from "../api/marketApi";
import type { MarketPredictionQuoteRequest } from "./market.types";

type QuoteVariables = {
  marketId: number;
  request: MarketPredictionQuoteRequest;
};

export function useMarketPredictionQuoteMutation() {
  return useMutation({
    mutationFn: ({ marketId, request }: QuoteVariables) =>
      getMarketPredictionQuote(marketId, request),
  });
}
