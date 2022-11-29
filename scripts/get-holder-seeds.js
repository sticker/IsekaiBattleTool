require("dotenv").config({ path: ".env" });
const shell = require("shelljs");
const log4js = require("log4js");
logger = log4js.getLogger();
logger.level = "all";
const Moralis = require("moralis/node");

const serverUrl = process.env.VUE_APP_MORALIS_SERVER_URL;
const appId = process.env.VUE_APP_MORALIS_APP_ID;
const moralisSecret = process.env.VUE_APP_MORALIS_SECRET;
const moralisChain = process.env.VUE_APP_MORALIS_CHAIN;
// logger.debug({serverUrl});
// logger.debug({appId});
// logger.debug({moralisSecret});
// logger.debug({moralisChain});

const main = async () => {
  await Moralis.start({ serverUrl, appId, moralisSecret });
  // // console.log(accounts[0]);
  // // console.log(process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS);
  let nfts = await Moralis.Web3API.token.getNFTOwners({
    address: process.env.ISEKAI_BATTLE_SEEDS_CONTRACT_ADDRESS,
    chain: moralisChain,
  });

  const results = [];
  // const holders = [];
  // const tokenIds = [];

  let allAmount = 0;

  for(let i = 0; i < nfts.result.length; i++) {
    const result = {
      token_id: nfts.result[i].token_id,
      amount: nfts.result[i].amount,
      owner_of: nfts.result[i].owner_of,
      metadata_name: JSON.parse(nfts.result[i].metadata).name,
    }
    results.push(result);
    allAmount += Number(result.amount);
    // results.push(nfts.result[i]);
    // holders.push(nfts.result[i].owner_of);
    // tokenIds.push(nfts.result[i].token_id);
  }

  while (nfts.next){
    nfts = await Moralis.Web3API.token.getNFTOwners({
      address: process.env.ISEKAI_BATTLE_SEEDS_CONTRACT_ADDRESS,
      cursor: nfts.cursor,
      chain: moralisChain,
    });
    for(let i = 0; i < nfts.result.length; i++) {
      const result = {
        token_id: nfts.result[i].token_id,
        amount: nfts.result[i].amount,
        owner_of: nfts.result[i].owner_of,
        metadata_name: JSON.parse(nfts.result[i].metadata).name,
      }
      results.push(result);
      allAmount += Number(result.amount);
    }
  }
  // 全件処理できているか確認
  // console.log(results.length);
  console.log('全種数: ' + allAmount);
  console.log('==============================================');

  console.log('合計保有数');
  // アドレスごとに保持数を集計
  // {address1: num1, address2: num2, ...}
  let count = results.reduce(function(prev, current) {
    prev[current.owner_of] = (prev[current.owner_of] || 0) + Number(current.amount);
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
    console.log(`${key}個: ${holder_count[key]}`);
  });
  console.log('==============================================');

  // 種ごとに集計
  const results_atk = [];
  const results_def = [];
  const results_luk = [];
  for(let i = 0; i < results.length; i++) {
    if(results[i].token_id === '0') results_atk.push(results[i]);
    if(results[i].token_id === '10') results_def.push(results[i]);
    if(results[i].token_id === '20') results_luk.push(results[i]);
  }
  console.log('ATK種保有数');
  // アドレスごとに保持数を集計
  // {address1: num1, address2: num2, ...}
  let count_atk = results_atk.reduce(function(prev, current) {
    prev[current.owner_of] = (prev[current.owner_of] || 0) + Number(current.amount);
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
    console.log(`${key}個: ${holder_count_atk[key]}`);
  });
  console.log('==============================================');
  console.log('DEF種保有数');
  // アドレスごとに保持数を集計
  // {address1: num1, address2: num2, ...}
  let count_def = results_def.reduce(function(prev, current) {
    prev[current.owner_of] = (prev[current.owner_of] || 0) + Number(current.amount);
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
    console.log(`${key}個: ${holder_count_def[key]}`);
  });
  console.log('==============================================');
  console.log('LUK種保有数');
  // アドレスごとに保持数を集計
  // {address1: num1, address2: num2, ...}
  let count_luk = results_luk.reduce(function(prev, current) {
    prev[current.owner_of] = (prev[current.owner_of] || 0) + Number(current.amount);
    return prev;
  }, {});

  // Object.keys(count_luk).forEach(function (key) {
  //   console.log(`${key}: ${count_luk[key]}`);
  // });

  // 保持数ごとにアドレス数を集計
  // {○体: ○件, ...}
  const holder_count_luk = Object.values(count_luk).reduce(function(prev, current) {
    prev[current] = (prev[current] || 0) + 1;
    return prev;
  }, {});

  // 保持数ごとのアドレス数を表示
  Object.keys(holder_count_luk).forEach(function (key) {
    console.log(`${key}個: ${holder_count_luk[key]}`);
  });
  console.log('==============================================');


  // const rank = Object.entries(count);
  // rank.sort((a,b) => {
  //   if (a[1] > b[1] ) return -1;
  //   if (b[1] > a[1] ) return 1;
  //   return 0;
  // });
  // console.log('合計保有数');
  // for(let i = 0; i < rank.length; i++) {
  //   console.log(`${i+1}位: ${rank[i][1]}個 (${rank[i][0]})`);
  // }
  // console.log('==============================================');


  // results_atk.sort((a,b) => {
  //   if (a.amount > b.amount ) return -1;
  //   if (b.amount > a.amount ) return 1;
  //   return 0;
  // });

  // results_def.sort((a,b) => {
  //   if (a.amount > b.amount ) return -1;
  //   if (b.amount > a.amount ) return 1;
  //   return 0;
  // });

  // results_luk.sort((a,b) => {
  //   if (a.amount > b.amount ) return -1;
  //   if (b.amount > a.amount ) return 1;
  //   return 0;
  // });

  // console.log('ATK種');
  // for(let i = 0; i < results_atk.length; i++) {
  //   console.log(`${i+1}位: ${results_atk[i].amount}個 (${results_atk[i].owner_of})`);
  // }

  // console.log('==============================================');

  // console.log('DEF種');
  // for(let i = 0; i < results_def.length; i++) {
  //   console.log(`${i+1}位: ${results_def[i].amount}個 (${results_def[i].owner_of})`);
  // }

  // console.log('==============================================');

  // console.log('LUK種');
  // for(let i = 0; i < results_luk.length; i++) {
  //   console.log(`${i+1}位: ${results_luk[i].amount}個 (${results_luk[i].owner_of})`);
  // }

};

main()
  .then(() => {
    shell.exit(0);
  })
  .catch((err) => {
    logger.error(err);
    shell.exit(1);
  });
