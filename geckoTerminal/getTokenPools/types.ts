import {
  TransactionMetrics,
  PriceChangePercentage,
  TokenRelationship,
} from "../sharedTypes";

type GeckoPoolResponse = {
  data: GeckoPool[];
};

type GeckoPool = {
  id: string;
  type: string;
  attributes: GeckoPoolAttributes;
  relationships: GeckoPoolRelationships;
};

type GeckoPoolAttributes = {
  base_token_price_usd: string;
  base_token_price_native_currency: string;
  quote_token_price_usd: string;
  quote_token_price_native_currency: string;
  base_token_price_quote_token: string;
  quote_token_price_base_token: string;
  address: string;
  name: string;
  pool_created_at: string;
  token_price_usd: string;
  fdv_usd: string;
  market_cap_usd: string | null;
  price_change_percentage: PriceChangePercentage;
  transactions: TransactionMetrics;
  volume_usd: VolumeMetrics;
  reserve_in_usd: string;
};

type VolumeMetrics = {
  m5: string;
  h1: string;
  h6: string;
  h24: string;
};

type GeckoPoolRelationships = {
  base_token: TokenRelationship;
  quote_token: TokenRelationship;
  dex: DexRelationship;
};

type DexRelationship = {
  data: {
    id: string;
    type: string;
  };
};

export type { GeckoPoolResponse, GeckoPool };
