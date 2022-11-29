require("dotenv").config({ path: ".env" });
const shell = require("shelljs");
const TruffleConfig = require("@truffle/config");
const TruffleProvider = require("@truffle/provider");
const Web3 = require("web3");
const yargs = require("yargs/yargs");
const log4js = require("log4js");
logger = log4js.getLogger();
logger.level = "all";
const Moralis = require("moralis/node");

const isekaiBattle = require("../abi/IsekaiBattle.json");
const isekaiBattleAbi = isekaiBattle.abi;
const isekaiBattleStake = require("../abi/IsekaiBattleStake.json");
const isekaiBattleStakeAbi = isekaiBattleStake.abi;

const serverUrl = process.env.VUE_APP_MORALIS_SERVER_URL;
const appId = process.env.VUE_APP_MORALIS_APP_ID;
const moralisSecret = process.env.VUE_APP_MORALIS_SECRET;
const moralisChain = process.env.VUE_APP_MORALIS_CHAIN;

const sortByAttr = (results, target, num) => {
  let sorted = results.sort(function(a, b) {
    const a_attributes = JSON.parse(a.metadata).attributes;
    let a_attr;
    for(let i = 0; i < a_attributes.length; i++) {
      if(a_attributes[i].trait_type === target) {
        a_attr = a_attributes[i].value;
      }
    }
    const b_attributes = JSON.parse(b.metadata).attributes;
    let b_attr;
    for(let i = 0; i < b_attributes.length; i++) {
      if(b_attributes[i].trait_type === target) {
        b_attr = b_attributes[i].value;
      }
    }
    return (Number(a_attr) > Number(b_attr)) ? -1 : 1;  //降順ソート
  });

  const ranking = [];
  for(let i = 0; i < num; i++) {
    const attributes = JSON.parse(sorted[i].metadata).attributes;
    let param;
    let level;
    for(let i = 0; i < attributes.length; i++) {
      if(attributes[i].trait_type === target) {
        param = attributes[i].value;
      }
      if(attributes[i].trait_type === 'Level') {
        level = attributes[i].value;
      }
    }
    ranking.push({
      token_id: sorted[i].token_id,
      owner_of: sorted[i].owner_of,
      param,
      level,
    })
  }

  return ranking;
}

const main = async () => {
  const argv = yargs(process.argv.slice(2))
    .option("network", {
      default: "development",
      string: true,
    })
    .option('address', {
      string: true
    })
    .argv;
  const { network, address } = argv;

  const truffleConfig = TruffleConfig.detect();
  const truffleProvider = TruffleProvider.create(
    truffleConfig.networks[network]
  );
  const web3 = new Web3(truffleProvider);
  const accounts = await web3.eth.getAccounts();

  const isekaiBattleAddr = process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS;
  const IsekaiBattle = new web3.eth.Contract(isekaiBattleAbi, isekaiBattleAddr);

  const isekaiBattleStakeAddr = process.env.ISEKAI_BATTLE_STAKE_CONTRACT_ADDRESS;
  const IsekaiBattleStake = new web3.eth.Contract(isekaiBattleStakeAbi, isekaiBattleStakeAddr);

  await Moralis.start({ serverUrl, appId, moralisSecret });
  // // console.log(accounts[0]);
  // // console.log(process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS);
  let nfts = await Moralis.Web3API.token.getNFTOwners({
    address: process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS,
    chain: moralisChain,
  });
  console.log(nfts);
  const results = [];
  const holders = [];
  const tokenIds = [];

  for(let i = 0; i < nfts.result.length; i++) {
    results.push(nfts.result[i]);
    tokenIds.push(nfts.result[i].token_id);
    if(nfts.result[i].owner_of.toLocaleLowerCase() === isekaiBattleStakeAddr.toLocaleLowerCase()) {
      const tokenOwner = await IsekaiBattleStake.methods.tokenOwners(nfts.result[i].token_id).call();
      holders.push(tokenOwner);
    } else {
      holders.push(nfts.result[i].owner_of);
    }
  }

  while (nfts.next){
    nfts = await Moralis.Web3API.token.getNFTOwners({
      address: process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS,
      cursor: nfts.cursor,
      chain: moralisChain,
    });
    for(let i = 0; i < nfts.result.length; i++) {
      results.push(nfts.result[i]);
      tokenIds.push(nfts.result[i].token_id);
      if(nfts.result[i].owner_of.toLocaleLowerCase() === isekaiBattleStakeAddr.toLocaleLowerCase()) {
        const tokenOwner = await IsekaiBattleStake.methods.tokenOwners(nfts.result[i].token_id).call();
        holders.push(tokenOwner);
      } else {
        holders.push(nfts.result[i].owner_of);
      }
    }
  }

  // 全件処理できているか確認
  console.log(holders.length);
  console.log(tokenIds.length);
  const s = new Set(tokenIds);
  console.log(s.size);
  console.log('==============================================');

  // アドレスごとに保持数を集計
  // {address1: num1, address2: num2, ...}
  let count = holders.reduce(function(prev, current) {
    prev[current] = (prev[current] || 0) + 1;
    return prev;
  }, {});

  // 保持数ごとにアドレス数を集計
  // {○体: ○件, ...}
  const holder_count = Object.values(count).reduce(function(prev, current) {
    prev[current] = (prev[current] || 0) + 1;
    return prev;
  }, {});

  // console.log(holder_count);

  // 保持数ごとのアドレス数を表示
  Object.keys(holder_count).forEach(function (key) {
    console.log(`${key}体: ${holder_count[key]}`);
  });

  console.log('==============================================');

  // 31体以上のアドレスを表示
  for (const [key, value] of Object.entries(count)) {
    if(value > 30) {
      console.log(`${value}体: ${key}`);
    }
  }

  console.log('==============================================');

  // Moralis側でmetadataの同期ができてない場合があるので直接チェーンから取得
  // したかったが、永遠に時間がかかるので、Moralisで取れなかったやつ限定で取得する
  for(let i = 0; i < results.length; i++) {
    if(results[i].metadata === null) {
      const tokenURI = await IsekaiBattle.methods.tokenURI(results[i].token_id).call();
      const metadataBase64 = tokenURI.substr(tokenURI.indexOf('base64,')+7);
      // const metadata = JSON.parse(atob(metadataBase64));
      const metadata = atob(metadataBase64);
      results[i].metadata = metadata;
    }
  }

  // パラメータランキング
  const top = 10;
  // ATK
  let ranking_ATK = sortByAttr(results, 'ATK', top);
  console.log(`### ATK Top ${top} ###`);
  for(let i = 0; i < top; i++) {
    let seedHistory = await IsekaiBattle.methods.getSeedHistory(ranking_ATK[i].token_id).call();
    console.log(`ATK: ${ranking_ATK[i].param} Level: ${ranking_ATK[i].level} seedHistory: ${seedHistory} id: ${ranking_ATK[i].token_id} owner: ${ranking_ATK[i].owner_of}`);
  }
  console.log('');
  // DEF
  let ranking_DEF = sortByAttr(results, 'DEF', top);
  console.log(`### DEF Top ${top} ###`);
  for(let i = 0; i < top; i++) {
    let seedHistory = await IsekaiBattle.methods.getSeedHistory(ranking_DEF[i].token_id).call();
    console.log(`DEF: ${ranking_DEF[i].param} Level: ${ranking_DEF[i].level} seedHistory: ${seedHistory} id: ${ranking_DEF[i].token_id} owner: ${ranking_DEF[i].owner_of}`);
  }
  console.log('');
  // LUK
  let ranking_LUK = sortByAttr(results, 'LUK', top);
  console.log(`### LUK Top ${top} ###`);
  for(let i = 0; i < top; i++) {
    let seedHistory = await IsekaiBattle.methods.getSeedHistory(ranking_DEF[i].token_id).call();
    console.log(`LUK: ${ranking_LUK[i].param} Level: ${ranking_LUK[i].level} seedHistory: ${seedHistory} id: ${ranking_LUK[i].token_id} owner: ${ranking_LUK[i].owner_of}`);
  }

};

main()
  .then(() => {
    shell.exit(0);
  })
  .catch((err) => {
    logger.error(err);
    shell.exit(1);
  });
