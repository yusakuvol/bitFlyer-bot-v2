# bitFlyer-bot-v2

## Usage

1. Insert your BitFlyer API keys into your environment variables:

```sh
BITFLYER_API_KEY=your_bitflyer_api_key
BITFLYER_API_SECRET=your_bitflyer_api_secret
```

2. Configure your trading strategy parameters:

Edit the `strategyConfig.ts` file to set up your trading parameters. For instance:

```
unit: 0.01, // The amount of currency to be traded
profitLine: 1.05, // The profit margin as a multiplier (1.05 equals a 5% profit margin)
buyingIntervalPercentage: 1, // The buying interval as a percentage
```

Use the `nano` command to open the `strategyConfig.ts` file in a text editor:

```sh
nano strategyConfig.ts
```

1. Run the trading bot:

```zsh
yarn start
```
