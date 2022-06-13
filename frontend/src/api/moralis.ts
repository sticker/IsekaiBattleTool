const Moralis = require('moralis/node');

const serverUrl = process.env.VUE_APP_MORALIS_SERVER_URL;
const appId = process.env.VUE_APP_MORALIS_APP_ID;
const moralisSecret = process.env.VUE_APP_MORALIS_SECRET;
const chain = 'eth';
let isStarted = false;

export const start = async () => {
  console.log('start!!');
  await Moralis.start({ serverUrl, appId, moralisSecret });
  isStarted = true;
};

export const getTokenIds = async (address: string, token_address: string ) => {
  if(!isStarted) await start();

  console.log({address});
  console.log({token_address});
  console.log({chain});
  const nfts = await Moralis.Web3API.account.getNFTsForContract({
    address,
    token_address,
    chain,
  });
  console.log(nfts);

  const tokenIds = [];
  for(let i = 0; i < nfts.result.length; i++) {

    tokenIds.push(nfts.result[i].token_id);
  }
  return tokenIds;
};
