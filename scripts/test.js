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

  const ret = await IsekaiBattle.methods.getSeedHistory(911).call();
  console.log(ret);

  const regionInfo = await IsekaiBattleStake.methods.regionInfos(0).call();
  console.log(regionInfo);

  const stakingInfos = await IsekaiBattleStake.methods.stakingInfos('0x05649549c574AaF1382E1eD925dc59DfdF588A23').call();
  console.log(stakingInfos);

  const getEstimate = await IsekaiBattleStake.methods.getEstimate().call({from: '0x05649549c574AaF1382E1eD925dc59DfdF588A23'});
  console.log(getEstimate);

  const stakingTokenIdsLength = await IsekaiBattleStake.methods.stakingTokenIdsLength('0x05649549c574AaF1382E1eD925dc59DfdF588A23', 0).call({from: '0x05649549c574AaF1382E1eD925dc59DfdF588A23'});
  for(let i = 0; i < stakingTokenIdsLength; i++) {
    const stakingTokenIds = await IsekaiBattleStake.methods.stakingTokenIds('0x05649549c574AaF1382E1eD925dc59DfdF588A23', 0, i).call({from: '0x05649549c574AaF1382E1eD925dc59DfdF588A23'});
    console.log(stakingTokenIds);
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
