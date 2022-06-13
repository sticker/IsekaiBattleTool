import { abi as isekaiBattleAbi } from '../../abi/IsekaiBattle.json';

import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

type Abi = any[];

export async function setUpContracts(web3: Web3): Promise<Contract> {
  const isekaiBattleAddr = process.env.VUE_APP_ISEKAI_BATTLE_CONTRACT_ADDRESS;
  const IsekaiBattle = new web3.eth.Contract(isekaiBattleAbi as Abi, isekaiBattleAddr);
  return IsekaiBattle;
}
