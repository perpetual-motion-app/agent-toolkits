import {
  TransactionMetrics,
  PriceChangePercentage,
  TokenRelationship,
} from "../sharedTypes";

type VolumeUSD = {
  m5: string;
  h1: string;
  h6: string;
  h24: string;
};

type PoolAttributes = {
  base_token_price_usd: string;
  base_token_price_native_currency: string;
  quote_token_price_usd: string;
  quote_token_price_native_currency: string;
  base_token_price_quote_token: string;
  quote_token_price_base_token: string | null;
  address: string;
  name: string;
  pool_created_at: string;
  fdv_usd: string;
  market_cap_usd: string | null;
  price_change_percentage: PriceChangePercentage;
  transactions: {
    m5: TransactionMetrics;
    m15: TransactionMetrics;
    m30: TransactionMetrics;
    h1: TransactionMetrics;
    h24: TransactionMetrics;
  };
  volume_usd: VolumeUSD;
  reserve_in_usd: string;
};

export type Pool = {
  id: string;
  type: string;
  attributes: PoolAttributes;
  relationships: {
    base_token: TokenRelationship;
    quote_token: TokenRelationship;
    dex: TokenRelationship;
  };
};

export type LatestPoolsResponse = {
  data: Pool[];
};
