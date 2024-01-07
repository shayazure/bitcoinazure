const express = require('express');
const axios = require('axios');

const app = express();

let gBitcoinRawValue, gSum, gCounter;

onload();

async function onload() {
  gBitcoinRawValue = await getBitcoinValue();
  gCounter = 0;
  gSum = gBitcoinRawValue;
}

setInterval(async () => {
  gBitcoinRawValue = await getBitcoinValue();

  if (gCounter <= 10) {
    gSum += gBitcoinRawValue;
    gCounter++;
  } else {
    gSum = gBitcoinRawValue;
    gCounter = 1;
  }
}, 1000 * 60);

app.get('/serviceA', async (req, res) => {
  try {
    const bitcoinValue = formatValue(gBitcoinRawValue);
    const timestamp = getFormattedTimestamp();

    let responseData = `Service A, bitcoin value is ${bitcoinValue} for ${timestamp}`;

    if (gCounter === 10) {
      responseData += ` The average value of the last 10 minutes is ${trimAvg(formatValue(gSum / 10))}`;
    }

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching bitcoin value:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Liveness probe endpoint
app.get('/serviceA/healthz', (req, res) => {
  "service A Health"
  res.status(200).send('OK');
});

// Readiness probe endpoint
app.get('/serviceA/ready', (req, res) => {
  "service B Ready"
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Service A listening at http://localhost:${port}`);
});




function formatValue(value) {
  return `$${parseInt((value + '').replace('.', ''))}`
}

async function getBitcoinValue() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin-subsidium');
    return response.data.market_data.current_price.usd;
  } catch (error) {
    console.error('Error getting bitcoin value:', error.message);
    throw error;
  }
}

function trimAvg(str) {
  const bitcoinValue = formatValue(gBitcoinRawValue);
  const idx = bitcoinValue.length - 1
  return str.slice(0, idx)
}
function getFormattedTimestamp() {
  const now = new Date();

  const year = now.getUTCFullYear().toString().slice(2);
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = now.getUTCDate().toString().padStart(2, '0');
  const hours = now.getUTCHours().toString().padStart(2, '0');
  const minutes = now.getUTCMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}UTC`;
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Service A running on port ${PORT}`);
});
