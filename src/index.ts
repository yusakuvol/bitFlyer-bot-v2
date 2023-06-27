import * as dotenv from "dotenv";
import { config } from "../strategyConfig";
import { BitFlyerClient } from "./bitFlyerClient";
import { BitFlyerWebSocket } from "./bitFlyerWebSocket";

const { unit, profitLine, buyingIntervalPercentage } = config;
const symbol = "BTC/JPY";
const subscribeChannel = "parent_order_events";
let averagePrice = 0;
let orderCount = 0;
let sellOrderId = "";

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
  console.log("Start bot");

  try {
    const { bitFlyerClient, bitFlyerWebSocket } = await initialize();

    try {
      // 動かした時点での価格をRESTで取得
      const { bid } = await bitFlyerClient.getTicker(symbol);

      // 買い注文を買い目ごとに8個作成(買い目パーセンテージごとに作成)
      for (let i = 0; i < 8; i++) {
        // 買い目の価格を計算
        const buyingPrice = Math.floor(
          bid * (1 - buyingIntervalPercentage / 100) ** i
        );

        // 買い注文を作成
        await bitFlyerClient.createLimitBuyOrder(symbol, unit, buyingPrice);
        console.log(`create buyOrder price: ${buyingPrice}`);
      }

      // 約定を取得
      bitFlyerWebSocket.subscribe(
        subscribeChannel,
        async (channel, message) => {
          // 平均取得価格を計算
          const price = message.data.price;
          orderCount++;
          averagePrice = (averagePrice * (orderCount - 1) + price) / orderCount;

          // sellOrderがある場合は注文をキャンセル
          if (sellOrderId === "") {
            await bitFlyerClient.cancelOrder(sellOrderId);
          }

          const sellPrice = Math.floor(averagePrice * profitLine);
          // 売り注文は平均取得価格からprofitLineをかけた価格で作成
          const order = await bitFlyerClient.createLimitSellOrder(
            symbol,
            unit,
            sellPrice
          );
          sellOrderId = order.id;
          console.log(`create sellOrder price: ${sellPrice}`);
        }
      );
    } catch (error) {
      bitFlyerWebSocket.unsubscribe(subscribeChannel);
      console.error(`unhandled error: ${error}`);
      console.log("Stop bot");
    }
  } catch (error) {
    console.error(`unhandled error: ${error}`);
    console.log("initialize failed");
  }
};

main();
