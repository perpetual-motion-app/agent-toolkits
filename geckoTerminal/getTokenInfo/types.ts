type TokenAttributes = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  image_url: string;
  coingecko_coin_id: string | null;
  websites: string[];
  discord_url: string | null;
  telegram_handle: string | null;
  twitter_handle: string | null;
  description: string;
  gt_score: number;
  categories: string[];
  gt_category_ids: string[];
};

export type TokenInfoResponse = {
  data: {
    id: string;
    type: string;
    attributes: TokenAttributes;
  };
};
