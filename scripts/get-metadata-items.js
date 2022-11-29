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
    .option('address', {
      string: true
    })
    .argv;
  const { address } = argv;

  const isekaiBattleWeaponAddr = process.env.ISEKAI_BATTLE_WEAPON_CONTRACT_ADDRESS;
  const isekaiBattleArmorAddr = process.env.ISEKAI_BATTLE_ARMOR_CONTRACT_ADDRESS;
  const isekaiBattleSeedsAddr = process.env.ISEKAI_BATTLE_SEEDS_CONTRACT_ADDRESS;

  await Moralis.start({ serverUrl, appId, moralisSecret });
  // console.log(accounts[0]);
  // console.log(process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS);
  let options = {
    chain: moralisChain,
    address,
    token_address: isekaiBattleWeaponAddr,
  };
  console.log({options});
  let nfts = await Moralis.Web3API.account.getNFTsForContract(options);
  logger.info('===== WEAPON =====');
  logger.info(nfts);

  options.token_address = isekaiBattleArmorAddr;
  nfts = await Moralis.Web3API.account.getNFTsForContract(options);
  logger.info('===== AROMOR =====');
  logger.info(nfts);

  options.token_address = isekaiBattleSeedsAddr;
  nfts = await Moralis.Web3API.account.getNFTsForContract(options);
  logger.info('===== SEEDS =====');
  logger.info(nfts);

};

main()
  .then(() => {
    shell.exit(0);
  })
  .catch((err) => {
    logger.error(err);
    shell.exit(1);
  });
