import Vuex from 'vuex';
import Web3 from 'web3';
import _ from 'lodash';

import { setUpContracts } from './contracts';
import { IState } from './interfaces';
import { getTokenIds, getNfts } from './api/moralis';
import { characterFromContract, weaponFromContract, armorFromContract } from './contract-models';

export function createStore(web3: Web3) {
  return new Vuex.Store<IState>({
    state: {
      accounts: [],
      defaultAccount: null,
      currentNetworkId: null,
      isekaiBattle: null,
      isekaiBattleStake: null,
      ownedCharacters: [],
      ownedWeapons: [],
      ownedArmors: [],
    },

    mutations: {
      setNetworkId(state, payload) {
        state.currentNetworkId = payload;
      },

      setAccounts(state: IState, payload) {
        state.accounts = payload.accounts;

        if (payload.accounts.length > 0) {
          state.defaultAccount = payload.accounts[0];
        }
        else {
          state.defaultAccount = null;
        }
      },

      setIsekaiBattle(state: IState, payload) {
        state.isekaiBattle = payload;
      },

      setIsekaiBattleStake(state: IState, payload) {
        state.isekaiBattleStake = payload;
      },

      updateDefaultAccount(state: IState, account) {
        state.defaultAccount = account;
      },

      updateOwnedCharacters(state: IState, { ownedCharacters }) {
        state.ownedCharacters = ownedCharacters;
      },

      updateOwnedWeapons(state: IState, { ownedWeapons }) {
        state.ownedWeapons = ownedWeapons;
      },

      updateOwnedArmors(state: IState, { ownedArmors }) {
        state.ownedArmors = ownedArmors;
      },

    },

    actions: {
      async initialize({ dispatch }) {
        await dispatch('setUpContracts');
        // await dispatch('pollNetwork');
        dispatch('initEquipments');
      },

      async setUpContracts({ commit }) {
        const contracts = await setUpContracts(web3);
        commit('setIsekaiBattle', contracts.IsekaiBattle);
        commit('setIsekaiBattleStake', contracts.IsekaiBattleStake);
      },

      async pollNetwork({ state, commit }) {
        const networkId = await web3.eth.net.getId();

        if(state.currentNetworkId !== networkId) {
          commit('setNetworkId', networkId);
        }
      },

      async pollAccountsAndNetwork({ state, dispatch, commit }) {
        let refresh = false;
        const networkId = await web3.eth.net.getId();

        if(state.currentNetworkId !== networkId) {
          commit('setNetworkId', networkId);
          refresh = true;
        }

        const accounts = await web3.eth.requestAccounts();

        if (!_.isEqual(state.accounts, accounts)) {
          commit('setAccounts', { accounts });
          refresh = true;
        }

        if(refresh) {
          await Promise.all([
            dispatch('fetchUserDetails'),
          ]);
        }

      },

      initEquipments({commit}) {
        console.log('initEquipments!');
        const equipments = require('@/assets/equipment/equipments.js');
        const ownedWeapons = [];
        const ownedArmors = [];
        for(let i = 0; i < equipments.default.weapons.length; i++) {
          const weapon = equipments.default.weapons[i];
          ownedWeapons.push({
            name: weapon.name,
            image: weapon.image,
            Lv: 1,
            Type: weapon.name,
            hold: 0,
          });
          ownedWeapons.push({
            name: weapon.name,
            image: weapon.image,
            Lv: 2,
            Type: weapon.name,
            hold: 0,
          });
          ownedWeapons.push({
            name: weapon.name,
            image: weapon.image,
            Lv: 3,
            Type: weapon.name,
            hold: 0,
          });
        }
        for(let i = 0; i < equipments.default.armors.length; i++) {
          const armor = equipments.default.armors[i];
          ownedArmors.push({
            name: armor.name,
            image: armor.image,
            Lv: 1,
            Type: armor.name,
            hold: 0,
          });
          ownedArmors.push({
            name: armor.name,
            image: armor.image,
            Lv: 2,
            Type: armor.name,
            hold: 0,
          });
          ownedArmors.push({
            name: armor.name,
            image: armor.image,
            Lv: 3,
            Type: armor.name,
            hold: 0,
          });
        }
        console.log(ownedWeapons);
        console.log(ownedArmors);
        commit('updateOwnedWeapons', { ownedWeapons });
        commit('updateOwnedArmors', { ownedArmors });
      },

      async fetchUserDetails({ dispatch }) {
        await dispatch('fetchCharacters');
        await dispatch('fetchWeapons');
        await dispatch('fetchArmors');
      },

      async fetchCharacters({ state, commit }) {
        if(!state.defaultAccount || !state.isekaiBattle || !state.isekaiBattleStake) return;
        console.log(process.env.VUE_APP_ISEKAI_BATTLE_CONTRACT_ADDRESS);
        const tokenIds = await getTokenIds(state.defaultAccount, process.env.VUE_APP_ISEKAI_BATTLE_CONTRACT_ADDRESS as string);
        console.log({tokenIds});
        const regionId = 0;
        const stakingTokenIdsLength = await state.isekaiBattleStake.methods.stakingTokenIdsLength(
          state.defaultAccount, regionId).call({from: state.defaultAccount});
        for(let i = 0; i < stakingTokenIdsLength; i++) {
          const stakingTokenIds = await state.isekaiBattleStake.methods.stakingTokenIds(state.defaultAccount, regionId, i).call({from: state.defaultAccount});
          tokenIds.push(stakingTokenIds);
        }
        const ownedCharacters = [];
        for(let i = 0; i < tokenIds.length; i++) {
          const res = await state.isekaiBattle.methods.tokenURI(tokenIds[i]).call({from: state.defaultAccount});
          const metadataBase64 = res.substr(res.indexOf('base64,')+7);
          const metadata = JSON.parse(atob(metadataBase64));
          const character = characterFromContract(tokenIds[i], metadata);
          ownedCharacters.push(character);
          commit('updateOwnedCharacters', { ownedCharacters });
        }
      },

      async fetchWeapons({ state, commit }) {
        if(!state.defaultAccount || !state.isekaiBattle) return;
        console.log(process.env.VUE_APP_ISEKAI_BATTLE_WEAPON_CONTRACT_ADDRESS);
        const nfts = await getNfts(state.defaultAccount, process.env.VUE_APP_ISEKAI_BATTLE_WEAPON_CONTRACT_ADDRESS as string);
        const ownedWeapons = state.ownedWeapons;
        for(let i = 0; i < nfts.length; i++) {
          const metadata = JSON.parse(nfts[i].metadata);
          const weapon = weaponFromContract(metadata, Number(nfts[i].amount));
          for(let j = 0; j < ownedWeapons.length; j++) {
            console.log(ownedWeapons[j]);
            if(ownedWeapons[j].name === weapon.Type && ownedWeapons[j].Lv === weapon.Lv) {
              ownedWeapons[j].hold = weapon.hold;
              console.log('update!', weapon.hold);
            }
          }
          console.log(ownedWeapons);
          commit('updateOwnedWeapons', { ownedWeapons });
        }
      },

      async fetchArmors({ state, commit }) {
        if(!state.defaultAccount || !state.isekaiBattle) return;
        console.log(process.env.VUE_APP_ISEKAI_BATTLE_ARMOR_CONTRACT_ADDRESS);
        const nfts = await getNfts(state.defaultAccount, process.env.VUE_APP_ISEKAI_BATTLE_ARMOR_CONTRACT_ADDRESS as string);
        const ownedArmors = state.ownedArmors;
        for(let i = 0; i < nfts.length; i++) {
          const metadata = JSON.parse(nfts[i].metadata);
          const armor = armorFromContract(metadata, Number(nfts[i].amount));
          for(let j = 0; j < ownedArmors.length; j++) {
            if(ownedArmors[j].name === armor.Type && ownedArmors[j].Lv === armor.Lv) {
              ownedArmors[j].hold = armor.hold;
            }
          }
          commit('updateOwnedArmors', { ownedArmors });
        }
      },

    }
  });
}
