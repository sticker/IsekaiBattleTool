import { abi as isekaiBattleAbi } from '../../abi/IsekaiBattle.json';
import { abi as isekaiBattleStakeAbi } from '../../abi/IsekaiBattleStake.json';

import Web3 from 'web3';
import { Contracts } from './interfaces';

type Abi = any[];

export async function setUpContracts(web3: Web3): Promise<Contracts> {
  const isekaiBattleAddr = process.env.VUE_APP_ISEKAI_BATTLE_CONTRACT_ADDRESS;
  const IsekaiBattle = new web3.eth.Contract(isekaiBattleAbi as Abi, isekaiBattleAddr);

  const isekaiBattleStakeAddr = process.env.VUE_APP_ISEKAI_BATTLE_STAKE_CONTRACT_ADDRESS;
  const IsekaiBattleStake = new web3.eth.Contract(isekaiBattleStakeAbi as Abi, isekaiBattleStakeAddr);

  return { IsekaiBattle, IsekaiBattleStake };
}
