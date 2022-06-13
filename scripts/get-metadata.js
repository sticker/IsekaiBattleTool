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

  await Moralis.start({ serverUrl, appId, moralisSecret });
  // console.log(accounts[0]);
  // console.log(process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS);
  const nfts = await Moralis.Web3API.account.getNFTsForContract({
    address,
    token_address: process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS,
    chain: "eth",
  });
  // console.log(nfts);
  for(let i = 0; i < nfts.result.length; i++) {
    let res = await IsekaiBattle.methods.tokenURI(nfts.result[i].token_id).call({from: accounts[0]});
    let metadataBase64 = res.substr(res.indexOf('base64,')+7)
    let metadata = JSON.parse(atob(metadataBase64))
    let attr = metadata.attributes
    for(let j = 0; j < attr.length; j++) {
      if(j === 0) {
        process.stdout.write(`${nfts.result[i].token_id},`)
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
