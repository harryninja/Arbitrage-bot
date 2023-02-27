const { PrismaClient } = require('@prisma/client');
import axios from 'axios';

const prisma = new PrismaClient();

export async function run(data: any, amount: any, symbol: any) {
  try {

    const opportunities = data.data;
    console.log(opportunities)
    if (opportunities.length === 0) {
      console.log('No arbitrage opportunities found');
      return;
    }

    const opportunity = opportunities;
    const buy_exchange = opportunity.order_buy.exchange;
    const sell_exchange = opportunity.order_sell.exchange;
    const buy_price = opportunity.order_buy.ask;
    const sell_price = opportunity.order_sell.bid;
    const quantity = amount / buy_price;
    const profit_pct = opportunity.arbitrage_profit;
    if (profit_pct < 0.5) {
      console.log(`Arbitrage opportunity below threshold: ${profit_pct.toFixed(2)}%`);

      await prisma.arbitrage.create({
        data: {
          pair: symbol,
          buy_exchange: buy_exchange,
          sell_exchange: sell_exchange,
          buy_price: buy_price,
          sell_price: sell_price,
          profit_pct: profit_pct,
          quantity: quantity,
          status: "Passed"
        }
      });

      return;
    }

    console.log(`Buying ${quantity} ${symbol} on ${buy_exchange} at ${buy_price}`);
    console.log(`Selling ${quantity} ${symbol} on ${sell_exchange} at ${sell_price}`);

        await prisma.arbitrage.create({
          data: {
            pair: symbol,
            buy_exchange: buy_exchange,
            sell_exchange: sell_exchange,
            buy_price: buy_price,
            sell_price: sell_price,
            profit_pct: profit_pct,
            quantity: quantity,
            status: "Bought"
          }
        });

  } catch (error) {
    console.error(error);
  }
}

async function placeBuyOrder(pair: any, amount: any, buyPrice: any, exchangePrices: any) {
  try {
    let lowestPrice = Infinity;
    let lowestExchange;
    for (const exchange in exchangePrices) {
      const price = parseFloat(exchangePrices[exchange]);
      if (price < lowestPrice) {
        lowestPrice = price;
        lowestExchange = exchange;
      }
    }
    if (lowestPrice <= buyPrice) {
      const response = await axios.post(`https://${lowestExchange}/api/v1/buy`, {
        pair: pair,
        amount: amount,
        price: lowestPrice
      });
      return {
        exchange: lowestExchange,
        response: response.data
      };
    }
  } catch (error) {
    console.error(error);
  }
}

async function placeSellOrder(pair: any, amount: any, sellPrice: any, exchangePrices: any) {
  try {
    let highestPrice = 0;
    let highestExchange;
    for (const exchange in exchangePrices) {
      const price = parseFloat(exchangePrices[exchange]);
      if (price > highestPrice) {
        highestPrice = price;
        highestExchange = exchange;
      }
    }
    if (highestPrice >= sellPrice) {
      const response = await axios.post(`https://${highestExchange}/api/v1/sell`, {
        pair: pair,
        amount: amount,
        price: highestPrice
      });
      return {
        exchange: highestExchange,
        response: response.data
      };
    }
  } catch (error) {
    console.error(error);
  }
}