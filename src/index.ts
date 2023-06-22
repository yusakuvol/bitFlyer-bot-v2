import * as dotenv from "dotenv";
import { config } from "../strategyConfig";
import { BitFlyerClient } from "./bitFlyerClient";
import { BitFlyerWebSocket } from "./bitFlyerWebSocket";

const { unit, profitLine, buyingIntervalPercentage } = config;
const symbol = "BTC/JPY";

// 初期化処理
const initialize = async () => {
  // 環境変数の設定
  dotenv.config();
  const apiKey = process.env.BITFLYER_API_KEY;
  const apiSecret = process.env.BITFLYER_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("API Key and API Secret are required");
  }

  // bitFlyerクライアントの初期化
  const bitFlyerClient = new BitFlyerClient(apiKey, apiSecret);

  // bitFlyerWebSocketの初期化
  const bitFlyerWebSocket = new BitFlyerWebSocket(apiKey, apiSecret);

  return { bitFlyerClient, bitFlyerWebSocket };
};

const main = async () => {
  try {
    const { bitFlyerClient, bitFlyerWebSocket } = await initialize();

    // websocketで板情報と約定履歴を取得
    bitFlyerWebSocket.subscribe("lightning_board_snapshot_BTC_JPY");

    // 現在の価格を取得
    const middlePrice = 0;

    // 買い注文を買い目ごとに8個作成(買い目パーセンテージごとに作成)
    for (let i = 1; i <= 8; i++) {
      // 買い目の価格を計算
      const buyingPrice = Math.floor(
        middlePrice * (1 - buyingIntervalPercentage / 100) ** i
      );
      // 買い注文を作成
      //   const order = await bitFlyerClient.createLimitBuyOrder(
      //     symbol,
      //     unit,
      //     buyingPrice
      //   );
      //   console.log(order);
    }

    // 売り注文を作成
  } catch (error) {
    console.error(error);
  }
};

main();
