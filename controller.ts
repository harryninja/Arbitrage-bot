const express = require('express');
const app = express();
import { Request, Response } from 'express';
import { run } from "./index";
import axios from 'axios';

app.use(express.json());

const pairs = ["BTC/USD", "MATIC/USD", "ETH/USD"]

// Endpoint for performing crypto arbitrage
app.post('/crypto-arbitrage', async (req: Request, res: Response) => {
  const { pair, amount, symbol } = req.body;

  try {
    // Call crypto arbitrage API to get prices
    const options = {
      method: 'GET',
      url: 'https://crypto-arbitrage.p.rapidapi.com/crypto-arb',
      params: {
        pair,
        consider_fees: 'True',
        selected_exchanges: 'bitflyer southxchange itbit cex bitfinex bitstamp1 bitstamp bitmex lykke bitfinex2 kraken independentreserve gemini'
        //'cex mercado crex24 bitforex bitstamp1 bitstamp'
      },
      headers: {
        'X-RapidAPI-Key': '0b12da68damshfaa5be0ffb4505ap14bdcajsn99f1b06a8845',
        'X-RapidAPI-Host': 'crypto-arbitrage.p.rapidapi.com'
      }
    };
      const response = await axios.request(options);

      const runBot = await run(response, amount, symbol)

    return runBot

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

  app.listen(3000, () => {
    console.log('Server started on port 3000');
  });
