require("dotenv").config({ path: ".env" });
const shell = require("shelljs");
const TruffleConfig = require("@truffle/config");
const TruffleProvider = require("@truffle/provider");
const Web3 = require("web3");
const yargs = require("yargs/yargs");
const log4js = require("log4js");
logger = log4js.getLogger();
logger.level = "all";

const isekaiBattle = require("../abi/IsekaiBattle.json");
const isekaiBattleAbi = isekaiBattle.abi;

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

  const snapshot = require('../balances/ISB-mainnet.json');

  // 全件処理できているか確認
  console.log(snapshot.length);
  console.log('==============================================');

  // アドレスごとに保持数を集計
  // {address1: num1, address2: num2, ...}
  let count = snapshot.reduce(function(prev, current) {
    prev[current.wallet] = current.tokenIds.length;
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

};

main()
  .then(() => {
    shell.exit(0);
  })
  .catch((err) => {
    logger.error(err);
    shell.exit(1);
  });
