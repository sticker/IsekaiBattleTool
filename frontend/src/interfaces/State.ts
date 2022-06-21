import { Contract } from 'web3-eth-contract';
import { ICharacter } from './index';

export interface IState {
  accounts: string[];
  defaultAccount: string | null;
  currentNetworkId: number | null;
  isekaiBattle: Contract | null;
  ownedCharacters: ICharacter[],
  ownedWeapons: ICharacter[],
  ownedArmors: ICharacter[],
}
