import * as dotenv from "dotenv";
import { config } from "../strategyConfig";
import { BitFlyerClient } from "./bitFlyerClient";

const { unit, profitLine, extraBuyLine } = config;

// 初期化処理
const initialize = async () => {
  // 環境変数の設定
  dotenv.config();
  const apiKey = process.env.BITFLYER_API_KEY;
  const apiSecret = process.env.BITFLYER_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("API Key and API Secret are required");
  }

  // bitflyerクライアントの初期化
  const bitFlyerClient = new BitFlyerClient(apiKey, apiSecret);
  return { bitFlyerClient };
};

const main = async () => {
  try {
    const { bitFlyerClient } = await initialize();
  } catch (error) {
    console.error(error);
  }
};

main();
