import type { MyMarketPredictionListParams } from './prediction.types';

type MyMarketPredictionFilters = Omit<MyMarketPredictionListParams, 'page' | 'size'>;

export const predictionKeys = {
  all: ["predictions"] as const,
  myMarketPrediction: (marketId: number) =>
    [...predictionKeys.all, "my-market-prediction", marketId] as const,
  myLists: () => [...predictionKeys.all, "my-list"] as const,
  myList: (filters: MyMarketPredictionFilters) =>
    [...predictionKeys.myLists(), filters] as const,
};
