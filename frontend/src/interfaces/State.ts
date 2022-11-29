import { Contract } from 'web3-eth-contract';
import { ICharacter, IWeapon, IArmor } from './index';

export interface IState {
  accounts: string[];
  defaultAccount: string | null;
  currentNetworkId: number | null;
  isekaiBattle: Contract | null;
  isekaiBattleStake: Contract | null;
  ownedCharacters: ICharacter[],
  ownedWeapons: IWeapon[],
  ownedArmors: IArmor[],
}
