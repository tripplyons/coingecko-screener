const fetch = require('node-fetch');
const API_ENDPOINT = 'https://api.coingecko.com/api/v3';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const MAX_REQUESTS_PER_MINUTE = 40;

async function apiCall(path, params=[]) {
  let paramsList = Object.keys(params).map(key => `${key}=${params[key]}`);
  const url = `${API_ENDPOINT}/${path}?${paramsList.join('&')}`;

  await sleep(60 * 1000 / MAX_REQUESTS_PER_MINUTE);
  const res = await fetch(url);
  const json = await res.json();
  return json;
}

class Screener {
  constructor() {
    this.coins = [];
  }

  async screen(minRank=1, maxRank=100) {
    this.coins = [];
    let startPage = Math.floor(minRank / 100) + 1;
    let endPage = Math.ceil(maxRank / 100);
    for(let page = startPage; page <= endPage; page++) {
      let addedCoins = await apiCall('coins/markets', {
        vs_currency: 'usd',
        page: page
      });
      this.coins = [...this.coins, ...addedCoins];
    }

    this.coins = this.coins.filter(coin => coin.market_cap_rank >= minRank);
    this.coins = this.coins.filter(coin => coin.market_cap_rank <= maxRank);

    for(let i in this.coins) {
      this.coins[i].displayedMetrics = {
        Rank: this.coins[i].market_cap_rank,
        Name: this.coins[i].name
        // ID: this.coins[i].id
      };
    }
  }

  async loadHistoricalData(days=1, baseCurrency='usd') {
    for(let i in this.coins) {
      this.coins[i].historicalData = await apiCall(`coins/${this.coins[i].id}/market_chart`, {
        id: this.coins[i].id,
        vs_currency: baseCurrency,
        days: days
      });
    }
  }
}

module.exports = Screener;
