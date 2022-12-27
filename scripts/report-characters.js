require("dotenv").config({ path: ".env" });
const shell = require("shelljs");
const Web3 = require("web3");
const yargs = require("yargs/yargs");
const log4js = require("log4js");
logger = log4js.getLogger();
logger.level = "all";
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");

const isekaiBattle = require("../abi/IsekaiBattle.json");
const isekaiBattleAbi = isekaiBattle.abi;
const isekaiBattleStake = require("../abi/IsekaiBattleStake.json");
const isekaiBattleStakeAbi = isekaiBattleStake.abi;

// const serverUrl = process.env.VUE_APP_MORALIS_SERVER_URL;
// const appId = process.env.VUE_APP_MORALIS_APP_ID;
// const moralisSecret = process.env.VUE_APP_MORALIS_SECRET;
const moralisChain =
  process.env.MORALIS_CHAIN === 'eth' ? EvmChain.ETHEREUM :
  process.env.MORALIS_CHAIN === 'goerli' ? EvmChain.GOERLI :
  '';


const sortByAttr = (results, target, num) => {
  let sorted = results.sort(function(a, b) {
    const a_attributes = a.metadata.attributes;
    let a_attr;
    for(let i = 0; i < a_attributes.length; i++) {
      if(a_attributes[i].trait_type === target) {
        a_attr = a_attributes[i].value;
      }
    }
    const b_attributes = b.metadata.attributes;
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
    const attributes = sorted[i].metadata.attributes;
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
      tokenId: sorted[i].tokenId,
      ownerOf: sorted[i].ownerOf._value,
      param,
      level,
    })
  }

  return ranking;
}

const main = async () => {
  // const privateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
  const httpProvider = new Web3.providers.HttpProvider(process.env.RPC_URL);
  // const provider = new HDWalletProvider({
  //   mnemonic: {
  //     phrase: process.env.ADMIN_WALLET_MNEMONIC
  //   },
  //   provider: httpProvider,
  //   privateKeys: [privateKey],
  // });
  const web3 = new Web3(httpProvider);
  const isekaiBattleAddr = process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS;
  const IsekaiBattle = new web3.eth.Contract(isekaiBattleAbi, isekaiBattleAddr);
  const isekaiBattleStakeAddr = process.env.ISEKAI_BATTLE_STAKE_CONTRACT_ADDRESS;
  const IsekaiBattleStake = new web3.eth.Contract(isekaiBattleStakeAbi, isekaiBattleStakeAddr);

  // キャラ発行数
  const charaAll = await IsekaiBattle.methods.totalSupply().call();
  logger.info('キャラ発行数: ' + charaAll);

  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY,
    // ...and any other configuration
  });

  const results = [];
  const holders = [];
  const stakingHolders = [];
  const tokenIds = [];

  let cursor = null;
  do {
    const response = await Moralis.EvmApi.nft.getNFTOwners({
      address: process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS,
      chain: moralisChain,
      limit: 100,
      cursor: cursor,
    });
    for(let i = 0; i < response.result.length; i++) {
      results.push(response.result[i]._data);
      tokenIds.push(response.result[i]._data.tokenId);
      if(response.result[i]._data.ownerOf._value.toLocaleLowerCase() === isekaiBattleStakeAddr.toLocaleLowerCase()) {
        const tokenOwner = await IsekaiBattleStake.methods.tokenOwners(response.result[i]._data.tokenId).call();
        holders.push(tokenOwner);
        stakingHolders.push(tokenOwner)
      } else {
        holders.push(response.result[i]._data.ownerOf._value);
      }
    }
    cursor = response.pagination.cursor;
  } while (cursor != "" && cursor != null);

  console.log('==============================================');

  // 全件処理できているか確認
  console.log(holders.length);
  console.log(tokenIds.length);
  const s = new Set(tokenIds);
  console.log(s.size);
  console.log('==============================================');

  logger.info('キャラステーキング数: ' + stakingHolders.length);

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
    logger.info(`${key}体: ${holder_count[key]}`);
  });

  console.log('==============================================');

  // 31体以上のアドレスを表示
  for (const [key, value] of Object.entries(count)) {
    if(value > 30) {
      logger.info(`${value}体: ${key}`);
    }
  }

  console.log('==============================================');

  // アドレスごとにステーキング数を集計
  // {address1: num1, address2: num2, ...}
  let staking_count = stakingHolders.reduce(function(prev, current) {
    prev[current] = (prev[current] || 0) + 1;
    return prev;
  }, {});

  // ステーキング数ごとにアドレス数を集計
  // {○体: ○件, ...}
  const staking_holder_count = Object.values(staking_count).reduce(function(prev, current) {
    prev[current] = (prev[current] || 0) + 1;
    return prev;
  }, {});

  // console.log(holder_count);

  // ステーキング数ごとのアドレス数を表示
  Object.keys(staking_holder_count).forEach(function (key) {
    logger.info(`${key}体: ${staking_holder_count[key]}`);
  });

  console.log('==============================================');

  // キャラパラメータランキング

  // // Moralis側でmetadataの同期ができてない場合があるので直接チェーンから取得
  // // したかったが、永遠に時間がかかるので、Moralisで取れなかったやつ限定で取得する
  // for(let i = 0; i < results.length; i++) {
  //   if(results[i].metadata === null) {
  //     const tokenURI = await IsekaiBattle.methods.tokenURI(results[i].tokenId).call();
  //     const metadataBase64 = tokenURI.substr(tokenURI.indexOf('base64,')+7);
  //     // const metadata = JSON.parse(atob(metadataBase64));
  //     const metadata = atob(metadataBase64);
  //     results[i].metadata = metadata;
  //   }
  // }

  // // パラメータランキング
  // const top = 10;
  // // ATK
  // let ranking_ATK = sortByAttr(results, 'ATK', top);
  // console.log(`### ATK Top ${top} ###`);
  // for(let i = 0; i < top; i++) {
  //   let seedHistory = await IsekaiBattle.methods.getSeedHistory(ranking_ATK[i].tokenId).call();
  //   console.log(`ATK: ${ranking_ATK[i].param} Level: ${ranking_ATK[i].level} seedHistory: ${seedHistory} id: ${ranking_ATK[i].tokenId} owner: ${ranking_ATK[i].ownerOf}`);
  // }
  // console.log('');
  // // DEF
  // let ranking_DEF = sortByAttr(results, 'DEF', top);
  // console.log(`### DEF Top ${top} ###`);
  // for(let i = 0; i < top; i++) {
  //   let seedHistory = await IsekaiBattle.methods.getSeedHistory(ranking_DEF[i].tokenId).call();
  //   console.log(`DEF: ${ranking_DEF[i].param} Level: ${ranking_DEF[i].level} seedHistory: ${seedHistory} id: ${ranking_DEF[i].tokenId} owner: ${ranking_DEF[i].ownerOf}`);
  // }
  // console.log('');
  // // LUK
  // let ranking_LUK = sortByAttr(results, 'LUK', top);
  // console.log(`### LUK Top ${top} ###`);
  // for(let i = 0; i < top; i++) {
  //   let seedHistory = await IsekaiBattle.methods.getSeedHistory(ranking_DEF[i].tokenId).call();
  //   console.log(`LUK: ${ranking_LUK[i].param} Level: ${ranking_LUK[i].level} seedHistory: ${seedHistory} id: ${ranking_LUK[i].tokenId} owner: ${ranking_LUK[i].ownerOf}`);
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
