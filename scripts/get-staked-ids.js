

require("dotenv").config({ path: ".env" });

const shell = require('shelljs');
const fs = require('fs');
const moment = require('moment');

const log4js = require('log4js');
logger = log4js.getLogger();
logger.level = "all";

const Moralis = require("moralis/node");

const serverUrl = process.env.VUE_APP_MORALIS_SERVER_URL;
const appId = process.env.VUE_APP_MORALIS_APP_ID;
const moralisSecret = process.env.VUE_APP_MORALIS_SECRET;
const moralisChain = process.env.VUE_APP_MORALIS_CHAIN;

const getNowStr = () => {
  return moment().format('YYYYMMDDHHmm');
}

//================================================
// from 'moralis/lib/node/MoralisWeb3Api.js'
//================================================
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

const getNextOptions = (result, options) => {
  const nextOptions = _objectSpread({}, options);

  if (!result || !result.page_size || !result.total || result.page === undefined) return options;

  if (result.cursor) {
    if (result.cursor !== "") nextOptions.cursor = result.cursor;
  } else {
    if (result.total > result.page_size * (result.page + 1)) {
      nextOptions.offset = (result.page + 1) * (nextOptions.limit || 500);
    }
  }

  return nextOptions;
}
//================================================


const main = async () => {

  const stake_contract_address = process.env.ISEKAI_BATTLE_STAKE_CONTRACT_ADDRESS

  await Moralis.start({ serverUrl, appId, moralisSecret });
  const options = {
    address: stake_contract_address,
    token_address: process.env.ISEKAI_BATTLE_CONTRACT_ADDRESS,
    chain: moralisChain,
  };
  let nfts = await Moralis.Web3API.account.getNFTsForContract(options);

  const tokenIds = [];
  for(let i = 0; i < nfts.result.length; i++) {
    tokenIds.push(nfts.result[i].token_id);
  }

  while (nfts.next){
    // nfts = await nfts.next();
    const nextOptions = getNextOptions(nfts, options);
    nfts = await Moralis.Web3API.account.getNFTsForContract(nextOptions);
    for(let i = 0; i < nfts.result.length; i++) {
      tokenIds.push(nfts.result[i].token_id);
    }
  }

  // sort
  tokenIds.sort(function(a,b){
    if( Number(a) < Number(b) ) return -1;
    if( Number(a) > Number(b) ) return 1;
    return 0;
  });

  const outputFileName = `get-staked-ids-${getNowStr()}.list`;

  for(let i = 0; i < tokenIds.length; i++) {
    fs.appendFileSync(outputFileName, `${tokenIds[i]}\n`);
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
