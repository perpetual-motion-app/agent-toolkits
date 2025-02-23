type TransactionMetrics = {
  buys: number;
  sells: number;
  buyers: number;
  sellers: number;
};

type PriceChangePercentage = {
  m5: string;
  h1: string;
  h6: string;
  h24: string;
};

type TokenRelationship = {
  data: {
    id: string;
    type: string;
  };
};

export { TransactionMetrics, PriceChangePercentage, TokenRelationship };
