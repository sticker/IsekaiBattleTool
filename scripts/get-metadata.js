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
  // console.log(accounts[0]);
  // console.log(process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS);
  console.log({
    address,
    token_address: process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS,
    chain: moralisChain,
  });
  const nfts = await Moralis.Web3API.account.getNFTsForContract({
    address,
    token_address: process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS,
    chain: moralisChain,
  });
  logger.info(nfts);

  const tokenIds = [];
  for(let i = 0; i < nfts.result.length; i++) {
    tokenIds.push(nfts.result[i].token_id);
  }

  const regionId = 0;
  const stakingTokenIdsLength = await IsekaiBattleStake.methods.stakingTokenIdsLength(
    address, regionId).call({from: accounts[0]});
  for(let i = 0; i < stakingTokenIdsLength; i++) {
    const stakingTokenIds = await IsekaiBattleStake.methods.stakingTokenIds(address, regionId, i).call({from: accounts[0]});
    tokenIds.push(stakingTokenIds);
  }
  for(let i = 0; i < tokenIds.length; i++) {
    let res = await IsekaiBattle.methods.tokenURI(tokenIds[i]).call({from: accounts[0]});
    let metadataBase64 = res.substr(res.indexOf('base64,')+7)
    let metadata = JSON.parse(atob(metadataBase64))
    let attr = metadata.attributes
    for(let j = 0; j < attr.length; j++) {
      if(j === 0) {
        process.stdout.write(`${tokenIds[i]},`)
      }
      process.stdout.write(`${attr[j].value},`)
    }
    process.stdout.write('\n');
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
