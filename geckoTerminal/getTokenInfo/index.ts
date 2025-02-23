import axios from "axios";
import { BASE_URL } from "../config";
import { TokenInfoResponse } from "./types";
import { sleep } from "@/utils/sleep";

export const getTokenInfo = async (tokenAddress: string, skipSleep = false) => {
  if (!skipSleep) {
    await sleep(2000);
  }
  const result = await axios.get<TokenInfoResponse>(
    `${BASE_URL}/networks/solana/tokens/${tokenAddress}/info`,
  );
  return result.data.data;
};

getTokenInfo("Cg4DdSbxHD2n6MbmrgssRfasrbdEVEAoGLVzUSWEr88");
