const Screener = require('../Screener');

class SharpeRatioScreener extends Screener {
  constructor() {
    super();
  }

  async screen(minRank=1, maxRank=200, minSharpeRatio=20, minPriceChange=0.01) {
    await super.screen(minRank, maxRank);

    this.coins = this.coins.filter(coin => coin.price_change_percentage_24h >= minPriceChange);

    await this.loadHistoricalData(1);
    await this.loadSharpeRatios();

    this.coins = this.coins.filter(coin => coin.sharpeRatio >= minSharpeRatio);
  }

  calculateSharpeRatio(historicalData) {
    let prices = historicalData.prices.map(snapshot => snapshot[1]);
    let returns = prices.map((price, i) => {
      if(i === 0) {
        return 0;
      }
      return (price - prices[i - 1]) / prices[i - 1];
    }).slice(1);
    let avgReturn = returns.reduce((a, b) => a + b) / returns.length;
    let stdDev = Math.sqrt(returns.map(returnVal => Math.pow(returnVal - avgReturn, 2)).reduce((a, b) => a + b) / returns.length);

    let totalTime = historicalData.prices.slice(-1)[0][0] - historicalData.prices[0][0];

    let pointsPerYear = 252 * 86400 * 1000 * prices.length / totalTime;

    return Math.sqrt(pointsPerYear) * avgReturn / stdDev;
  }

  async loadSharpeRatios() {
    for(let i in this.coins) {
      let sharpeRatio = this.calculateSharpeRatio(this.coins[i].historicalData);
      this.coins[i].sharpeRatio = sharpeRatio;
      this.coins[i].displayedMetrics['Sharpe Ratio'] = sharpeRatio.toFixed(2);
    }
  }
}

module.exports = SharpeRatioScreener;
