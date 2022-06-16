<template>
  <div class="main-nav-div">
    <b-navbar class="main-nav" toggleable="sm">
      <button v-if="enableWallet" type="button" class="nes-btn nes-pointer is-warning"
        @click="connectMetamask()">
        Wallet Connect
      </button>
      <div class="input-address">
        <input type="input" class=" nes-input" placeholder="input address 0x..." v-model="inputAddress">
      </div>
      <button type="button" class="nes-btn nes-pointer"
        @click="onUpdateAccount()">
        GO
      </button>
      <div class="discord-login ml-auto d-none d-sm-flex">
        <div v-if="haveOgRole" class="role">game-guild-OG</div>
        <img src="@/assets/Discord-Logo-Color.png" class="discord-icon nes-pointer" @click="onLoginDiscord()"/>
      </div>
    </b-navbar>

  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import axios from 'axios';
import * as querystring from 'querystring';

export default {
  inject: ['web3', 'expectedNetworkId'],

  data: () => ({
    inputAddress: '',
    enableWallet: false,
    haveOgRole: false,
  }),

  computed: {
    ...mapState(['defaultAccount', 'currentNetworkId', 'ownedCharacters']),

  },

  methods: {
    ...mapActions(['initialize', 'pollAccountsAndNetwork', 'fetchUserDetails']),
    ...mapMutations(['updateDefaultAccount']),

    onUpdateAccount() {
      if(this.inputAddress.length === 42 && this.inputAddress.startsWith('0x')) {
        this.updateDefaultAccount(this.inputAddress);
        this.fetchUserDetails();
      }
    },

    async onLoginDiscord() {
      const params = {
        client_id: process.env.VUE_APP_DISCORD_CLIENT_ID,
        redirect_uri: process.env.VUE_APP_BASE_URL,
        response_type: 'code',
        scope: 'identify guilds guilds.members.read',
      };
      const redirect_uri = 'https://discord.com/api/oauth2/authorize?' + querystring.stringify(params);
      console.log(redirect_uri);
      window.location.href = redirect_uri;
    },

    async configureMetaMask() {
      const web3 = this.web3.currentProvider;
      if (this.expectedNetworkId === 1 && this.currentNetworkId !== 1) {
        try {
          await web3.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }],
          });
        } catch (switchError) {
          try {
            await web3.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x1',
                  chainName: 'Ethereum Main Network',
                  nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: [
                    'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
                  ],
                  blockExplorerUrls: ['https://etherscan.io/'],
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
      }
    },

    async connectMetamask() {
      const web3 = this.web3.currentProvider;
      this.configureMetaMask();
      this.errorMessage = 'Connecting to MetaMask...';
      web3
        .request({ method: 'eth_requestAccounts' })
        .then(async () => {
          this.errorMessage = 'Success: MetaMask connected.';
          this.doPollAccounts = true;
          const pollAccounts = async () => {
            if (!this.doPollAccounts) return;
            try {
              await this.pollAccountsAndNetwork();
            } catch (e) {
              console.error(e);
            }
            setTimeout(pollAccounts, 200);
          };
          pollAccounts();
        })
        .catch(() => {
          this.errorMessage = 'Error: MetaMask could not get permissions.';
        });
    },
  },

  async created() {
    if(process.env.VUE_APP_ENABLE_WALLET) {
      this.enableWallet = true;
    }
    try {
      await this.initialize();
    } catch (e) {
      console.error(e);
      this.errorMessage = e.message;
    }
    await this.configureMetaMask();
  },

  async mounted() {
    this.$nextTick(async function () {
      if (this.$route.query.code !== undefined) {
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
        };
        const params = {
          client_id: process.env.VUE_APP_DISCORD_CLIENT_ID,
          client_secret: process.env.VUE_APP_DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: this.$route.query.code,
          redirect_uri: process.env.VUE_APP_BASE_URL,
        };
        const res = await axios.post('https://discord.com/api/oauth2/token', querystring.stringify(params), { headers },);
        headers.Authorization = `Bearer ${res.data.access_token}`;
        const ret = await axios.get('https://discordapp.com/api/users/@me/guilds/900029842450415636/member', { headers });
        if(ret.data.roles.includes('983203802524049408')) {
          console.log('You have game-guild-OG roll!!');
          this.haveOgRole = true;
        }
      }
    });
  },
};
</script>

<style>
.input-address {
  width: 750px;

}

.discord-login {
  display: flex;
  align-items: center;
  color: white;
}

.discord-icon {
  height: 50px;
}



.role {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.roles {
  width: 250px;
  align-items: center;
  font-size: xx-small;
}


a {
  text-decoration: none;
  user-select: none;
  color: white !important;
}

a:hover,
a.router-link-active {
  color: #e7bcf2;
  text-shadow: 0 0 5px #333, 0 0 10px #333, 0 0 15px #ecbdff, 0 0 10px #ecbdff;
  text-decoration: none !important;
}

@media (max-width: 576px) {
  .main-nav {
    align-items: normal !important; /** force only for mobile to manually set alignments **/
    flex-direction: column;
  }
  .main-nav > .navbar-brand {
    align-self: center;
  }
  .main-nav > .navbar-nav {
    flex-direction: row;
    justify-content: space-evenly;
  }
  .skill-display-mobile  {
    flex: 5;
  }
  .skill-display-mobile > .balance-container {
    font-size: 0.8em;
  }
  .options-display-mobile {
    flex: 1;
    align-items: flex-end;
  }
}
</style>

<style scoped>
.logo {
  max-width: 300px;
}

.navbar {
  background: #212529;
}
.main-nav > .view-links {
  flex : 2.3;
}
.nav-logo {
  flex : 0.5;
}

.container_row{
  display: grid;
  justify-items: center;
}

.expander-divider {
  width: 100%;
  position: relative;
}

.expander-divider, .expander-button{
  grid-column: 1;
  grid-row: 1;
}
</style>


