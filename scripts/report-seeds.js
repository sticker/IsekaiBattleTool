require("dotenv").config({ path: ".env" });
const shell = require("shelljs");
const Web3 = require("web3");
const log4js = require("log4js");
logger = log4js.getLogger();
logger.level = "all";
const axios = require('axios')
const QuickChart = require('quickchart-js');
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");

const moralisChain =
  process.env.MORALIS_CHAIN === 'eth' ? EvmChain.ETHEREUM :
  process.env.MORALIS_CHAIN === 'goerli' ? EvmChain.GOERLI :
  '';


const main = async () => {
  const output = [];
  const outputRanking = [];
  const httpProvider = new Web3.providers.HttpProvider(process.env.RPC_URL);
  const web3 = new Web3(httpProvider);

  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY,
  });

  const results = [];
  let allAmount = 0;
  let atkAmount = 0;
  let defAmount = 0;
  let lukAmount = 0;

  let cursor = null;
  do {
    const response = await Moralis.EvmApi.nft.getNFTOwners({
      address: process.env.ISEKAI_BATTLE_SEEDS_CONTRACT_ADDRESS,
      chain: moralisChain,
      limit: 100,
      cursor: cursor,
    });
    for(let i = 0; i < response.result.length; i++) {
      const result = {
        tokenId: response.result[i]._data.tokenId,
        ownerOf: response.result[i]._data.ownerOf._value,
        name: response.result[i]._data.metadata.name,
        amount: response.result[i]._data.amount,
      }
      if (result.ownerOf === '0x2e215DCf8B4Ea801de619bbBC828a3142b170F20') // 運営保有分を除く
        continue;

      results.push(result);
      allAmount += Number(result.amount);
      if (Number(result.tokenId) >= 0 && Number(result.tokenId) < 10) atkAmount += Number(result.amount);
      if (Number(result.tokenId) >= 10 && Number(result.tokenId) < 20) defAmount += Number(result.amount);
      if (Number(result.tokenId) >= 20 && Number(result.tokenId) < 30) lukAmount += Number(result.amount);
    }
    cursor = response.pagination.cursor;
  } while (cursor != "" && cursor != null);

  output.push('==============================================');

  // 全件処理できているか確認
  output.push(`全種数: ${allAmount} (ATK:${atkAmount} DEF:${defAmount} LUK:${lukAmount})`);
  output.push(' ');
  output.push('■合計保有数');

  // アドレスごとに保持数を集計
  // {address1: num1, address2: num2, ...}
  let count = results.reduce(function(prev, current) {
    prev[current.ownerOf] = (prev[current.ownerOf] || 0) + Number(current.amount);
    return prev;
  }, {});

  // 保持数ごとにアドレス数を集計
  // {○体: ○件, ...}
  const holder_count = Object.values(count).reduce(function(prev, current) {
    prev[current] = (prev[current] || 0) + 1;
    return prev;
  }, {});

  // 保持数ごとのアドレス数を表示
  Object.keys(holder_count).forEach(function (key) {
    output.push(`${key}個: ${holder_count[key]}`);
  });
  output.push(' ');

  // 種ごとに集計
  const results_atk = [];
  const results_def = [];
  const results_luk = [];
  for(let i = 0; i < results.length; i++) {
    if(results[i].tokenId === '0') results_atk.push(results[i]);
    if(results[i].tokenId === '10') results_def.push(results[i]);
    if(results[i].tokenId === '20') results_luk.push(results[i]);
  }
  output.push('■ATK');
  // アドレスごとに保持数を集計
  // {address1: num1, address2: num2, ...}
  let count_atk = results_atk.reduce(function(prev, current) {
    prev[current.ownerOf] = (prev[current.ownerOf] || 0) + Number(current.amount);
    return prev;
  }, {});

  // 保持数ごとにアドレス数を集計
  // {○体: ○件, ...}
  const holder_count_atk = Object.values(count_atk).reduce(function(prev, current) {
    prev[current] = (prev[current] || 0) + 1;
    return prev;
  }, {});

  // 保持数ごとのアドレス数を表示
  Object.keys(holder_count_atk).forEach(function (key) {
    output.push(`${key}個: ${holder_count_atk[key]}`);
  });
  output.push(' ');
  output.push('■DEF');
  // アドレスごとに保持数を集計
  // {address1: num1, address2: num2, ...}
  let count_def = results_def.reduce(function(prev, current) {
    prev[current.ownerOf] = (prev[current.ownerOf] || 0) + Number(current.amount);
    return prev;
  }, {});

  // 保持数ごとにアドレス数を集計
  // {○体: ○件, ...}
  const holder_count_def = Object.values(count_def).reduce(function(prev, current) {
    prev[current] = (prev[current] || 0) + 1;
    return prev;
  }, {});

  // 保持数ごとのアドレス数を表示
  Object.keys(holder_count_def).forEach(function (key) {
    output.push(`${key}個: ${holder_count_def[key]}`);
  });
  output.push(' ');
  output.push('■LUK');
  // アドレスごとに保持数を集計
  // {address1: num1, address2: num2, ...}
  let count_luk = results_luk.reduce(function(prev, current) {
    prev[current.ownerOf] = (prev[current.ownerOf] || 0) + Number(current.amount);
    return prev;
  }, {});

  // Object.keys(count_luk).forEach(function (key) {
  //   output.push(`${key}: ${count_luk[key]}`);
  // });

  // 保持数ごとにアドレス数を集計
  // {○体: ○件, ...}
  const holder_count_luk = Object.values(count_luk).reduce(function(prev, current) {
    prev[current] = (prev[current] || 0) + 1;
    return prev;
  }, {});

  // 保持数ごとのアドレス数を表示
  Object.keys(holder_count_luk).forEach(function (key) {
    output.push(`${key}個: ${holder_count_luk[key]}`);
  });
  output.push('==============================================');


  const rank = Object.entries(count);
  rank.sort((a,b) => {
    if (a[1] > b[1] ) return -1;
    if (b[1] > a[1] ) return 1;
    return 0;
  });

  let rankNum = 1;
  let amountNow = 0;

  outputRanking.push('合計保有数');
  for(let i = 0; i < rank.length; i++) {
    if (i > 0 && Number(rank[i][1]) < Number(amountNow)) {
      rankNum++;
    }
    if (rankNum > 5) break;
    outputRanking.push(`${rankNum}位: ${rank[i][1]}個 (${rank[i][0]})`);
    amountNow = Number(rank[i][1]);
  }
  outputRanking.push('==============================================');


  results_atk.sort((a,b) => {
    if (a.amount > b.amount ) return -1;
    if (b.amount > a.amount ) return 1;
    return 0;
  });

  results_def.sort((a,b) => {
    if (a.amount > b.amount ) return -1;
    if (b.amount > a.amount ) return 1;
    return 0;
  });

  results_luk.sort((a,b) => {
    if (a.amount > b.amount ) return -1;
    if (b.amount > a.amount ) return 1;
    return 0;
  });

  rankNum = 1;
  amountNow = 0;
  outputRanking.push('ATK種');
  for(let i = 0; i < results_atk.length; i++) {
    if (i > 0 && Number(results_atk[i].amount) < Number(amountNow)) {
      rankNum++;
    }
    if (rankNum > 5) break;
    outputRanking.push(`${rankNum}位: ${results_atk[i].amount}個 (${results_atk[i].ownerOf})`);
    amountNow = Number(results_atk[i].amount);
  }

  outputRanking.push('==============================================');

  rankNum = 1;
  amountNow = 0;
  outputRanking.push('DEF種');
  for(let i = 0; i < results_def.length; i++) {
    if (i > 0 && Number(results_def[i].amount) < Number(amountNow)) {
      rankNum++;
    }
    if (rankNum > 5) break;
    outputRanking.push(`${rankNum}位: ${results_def[i].amount}個 (${results_def[i].ownerOf})`);
    amountNow = Number(results_def[i].amount);
  }

  outputRanking.push('==============================================');

  rankNum = 1;
  amountNow = 0;
  outputRanking.push('LUK種');
  for(let i = 0; i < results_luk.length; i++) {
    if (i > 0 && Number(results_luk[i].amount) < Number(amountNow)) {
      rankNum++;
    }
    if (rankNum > 5) break;
    outputRanking.push(`${rankNum}位: ${results_luk[i].amount}個 (${results_luk[i].ownerOf})`);
    amountNow = Number(results_luk[i].amount);
  }

  console.log(output.join("\n"));
  console.log(outputRanking.join("\n"));

  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-type': 'application/json',
    }
  }
  // await axios.post(process.env.WEBHOOK_URL, {content: output.join("\n")}, config);
  await axios.post(process.env.WEBHOOK_URL, {content: output.join("\n")}, config);

  // Create the chart
  const chart = new QuickChart();
  chart.setConfig({
    type: 'doughnut',
    data: {
      labels: ['ATK種', 'DEF種', 'LUK種'],
      datasets: [{
        data: [atkAmount, defAmount, lukAmount],
        backgroundColor: ['#ff5656', '#ffb056', '#fff456']
      }],
    },
    options: {
      plugins: {
        doughnutlabel: {
          labels: [{ text: String(allAmount), font: { size:20 } }, { text: '合計' }]
        }
      }
    },
  });

  const chartEmbed = {
    title: '全種数',
    image: {
      url: chart.getUrl(),
    },
  };

  let data = {
    embeds: [chartEmbed]
  };

  await axios.post(process.env.WEBHOOK_URL, data);

};

main()
  .then(() => {
    shell.exit(0);
  })
  .catch((err) => {
    logger.error(err);
    shell.exit(1);
  });
