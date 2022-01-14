const ChosenScreener = require('./src/screeners/SharpeRatioScreener');
const AsciiTable = require('ascii-table')


async function main() {
  let screener = new ChosenScreener();
  await screener.screen();

  let coins = screener.coins;

  let table = new AsciiTable('Coins');
  table.setHeading(Object.keys(coins[0].displayedMetrics));
  for(let i in coins) {
    table.addRow(Object.values(coins[i].displayedMetrics));
  }
  console.log(table.toString());
}

main();
