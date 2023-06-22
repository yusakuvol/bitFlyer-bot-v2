import crypto from "crypto";
import { io } from "socket.io-client";

type ErrorResponse = {
  status: "ERROR";
  error_message: string;
};

type SuccessResponse = {
  status: "OK";
};

type Response = ErrorResponse | SuccessResponse;

export class BitFlyerWebSocket {
  private socket;
  private secret: string;

  constructor(private apiKey: string, private apiSecret: string) {
    this.secret = apiSecret;
    this.socket = io("https://io.lightstream.bitflyer.com", {
      transports: ["websocket"],
    });
    this.socket.on("connect", this.authenticate.bind(this));
    this.socket.on("message", this.handleMessage);
  }

  authenticate() {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString("hex");
    const message = timestamp + nonce;
    const signature = crypto
      .createHmac("sha256", this.secret)
      .update(message)
      .digest("hex");
    const authParams = {
      api_key: this.apiKey,
      timestamp,
      nonce,
      signature,
    };

    this.socket.emit("auth", authParams, (response: Response) => {
      // if (response.status === "OK") {
      //   console.log("Authenticated successfully");
      // } else {
      //   console.error("Authentication failed", response);
      // }
    });
  }

  handleMessage(message: string) {
    console.log("Received message: ", message);
  }

  subscribe(channel: string) {
    this.socket.emit("subscribe", channel, (response: Response) => {
      // if (response.status === "OK") {
      //   console.log(`Subscribed to ${channel} successfully`);
      // } else {
      //   console.error(`Failed to subscribe to ${channel}`, response);
      // }
    });
    this.socket.on(channel, (message) => {
      console.log(channel, message);
    });
  }

  unsubscribe(channel: string) {
    this.socket.emit("unsubscribe", channel, (response: Response) => {
      if (response.status === "OK") {
        console.log(`Unsubscribed from ${channel} successfully`);
      } else {
        console.error(`Failed to unsubscribe from ${channel}`, response);
      }
    });
  }
}
