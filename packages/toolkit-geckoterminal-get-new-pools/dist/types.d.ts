import { Pool } from '@perpetual-motion-app/shared';
export interface TokenReference {
    id: string;
    type: string;
}
export interface TransactionMetrics {
    buys: number;
    sells: number;
    buyers: number;
    sellers: number;
}
export interface VolumeUSD {
    m5: string;
    h1: string;
    h6: string;
    h24: string;
}
export interface PriceChangePercentage {
    m5: string;
    h1: string;
    h6: string;
    h24: string;
}
export interface Transactions {
    m5: TransactionMetrics;
    m15: TransactionMetrics;
    m30: TransactionMetrics;
    h1: TransactionMetrics;
    h24: TransactionMetrics;
}
export interface PoolData {
    id: string;
    type: string;
    attributes: {
        base_token_price_usd: string;
        base_token_price_native_currency: string;
        quote_token_price_usd: string;
        quote_token_price_native_currency: string;
        base_token_price_quote_token: string;
        quote_token_price_base_token: string;
        address: string;
        name: string;
        pool_created_at: string;
        fdv_usd: string;
        market_cap_usd: string | null;
        price_change_percentage: PriceChangePercentage;
        transactions: Transactions;
        volume_usd: VolumeUSD;
        reserve_in_usd: string;
    };
    relationships: {
        base_token: {
            data: TokenReference;
        };
        quote_token: {
            data: TokenReference;
        };
        dex: {
            data: {
                id: string;
                type: string;
            };
        };
    };
}
export interface GetNewPoolsResponse {
    data: Pool[];
    meta: {
        total_pages: number;
        current_page: number;
    };
}
export interface GetNewPoolsParams {
    network?: string;
    page?: number;
    limit?: number;
}
