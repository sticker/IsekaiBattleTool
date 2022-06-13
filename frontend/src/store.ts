import Vuex from 'vuex';
import Web3 from 'web3';
import _ from 'lodash';

import { setUpContracts } from './contracts';
import { IState } from './interfaces';
import { getTokenIds } from './api/moralis';
import { characterFromContract } from './contract-models';

export function createStore(web3: Web3) {
  return new Vuex.Store<IState>({
    state: {
      accounts: [],
      defaultAccount: null,
      currentNetworkId: null,
      isekaiBattle: null,
      ownedCharacters: [],
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

      updateDefaultAccount(state: IState, account) {
        state.defaultAccount = account;
      },

      updateOwnedCharacters(state: IState, { ownedCharacters }) {
        state.ownedCharacters = ownedCharacters;
      },

    },

    actions: {
      async initialize({ dispatch }) {
        await dispatch('setUpContracts');
        await dispatch('pollNetwork');
      },

      async setUpContracts({ commit }) {
        const isekaiBattle = await setUpContracts(web3);
        commit('setIsekaiBattle', isekaiBattle);
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

      async fetchUserDetails({ dispatch }) {
        await dispatch('fetchCharacters');
      },

      async fetchCharacters({ state, commit }) {
        if(!state.defaultAccount || !state.isekaiBattle) return;
        console.log(process.env.VUE_APP_ISEKAI_BATTLE_CONTRACT_ADDRESS);
        const tokenIds = await getTokenIds(state.defaultAccount, process.env.VUE_APP_ISEKAI_BATTLE_CONTRACT_ADDRESS as string);
        console.log({tokenIds});
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

    }
  });
}
