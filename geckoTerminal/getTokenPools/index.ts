import axios from "axios";
import { BASE_URL } from "../config";
import { GeckoPoolResponse } from "./types";
import { sleep } from "@/utils/sleep";
export const getTokenPools = async (
  tokenAddress: string,
  skipSleep = false,
) => {
  if (!skipSleep) {
    await sleep(2000);
  }
  const result = await axios.get<GeckoPoolResponse>(
    `${BASE_URL}/networks/solana/tokens/${tokenAddress}/pools`,
  );
  return result.data.data;
};
