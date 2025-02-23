export interface TokenStats {
  priceChange: number;
  buyVolume: number;
  sellVolume?: number;
  buyOrganicVolume?: number;
  numBuys: number;
  numSells?: number;
  numTraders: number;
  numBuyers: number;
  numSellers?: number;
}

export interface TokenAudit {
  mintAuthorityDisabled: boolean;
  freezeAuthorityDisabled: boolean;
  topHoldersPercentage: number;
}

export interface BaseAsset {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
  decimals: number;
  twitter?: string;
  website?: string;
  circSupply: number;
  totalSupply: number;
  tokenProgram: string;
  launchpad: string;
  holderCount: number;
  fdv: number;
  mcap: number;
  usdPrice: number;
  stats5m: TokenStats;
  stats1h: TokenStats;
  stats6h: TokenStats;
  stats24h: TokenStats;
  audit: TokenAudit;
  organicScore: number;
  organicScoreLabel: string;
}

export interface JupiterPool {
  id: string;
  chain: string;
  dex: string;
  type: string;
  baseAsset: BaseAsset;
  createdAt: string;
  liquidity: number;
  bondingCurve: number;
  volume24h: number;
  updatedAt: string;
}

export interface JupiterResponse {
  pools: JupiterPool[];
  total: number;
  next: number;
}

export interface GetNewPoolsParams {
  maxAgeMinutes?: number;  // Maximum age of pools to fetch
  limit?: number;          // Maximum number of pools to return
}

export interface GetNewPoolsResponse {
  pools: JupiterPool[];
  hasMore: boolean;       // Indicates if there are more pools to fetch
  nextCursor?: number;    // Cursor for pagination if needed
} 