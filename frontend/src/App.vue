<template>
  <div class="wrapper">
    <nav-bar />
    <div class="row mt-3">
      <div class="col col-sm-4 col-md-4 col-lg-4 ml-5 mr-3 nes-container with-title is-centered">
        <p class="title">Your Characters</p>
        <ul class="character-list owned" v-dragula="ownedCharacters" bag="party-bag">
          <li
            class=""
            v-for="c in ownedCharacters"
            :key="c.tokenId"
            @click="$emit('input', c.tokenId)"
          >
            <img class="character-img nes-pointer"
              :src="require(`@/assets/character/${ c.name.split(' ')[0] }.png`)"
              v-tooltip.right="detailTooltipHtml(c)" />
          </li>
        </ul>
      </div>
      <div class="col">
        <div class="nes-container with-title is-centered party">
          <p class="title">Attack: {{ memberCount('attack') }}</p>
          <ul class="character-list attack" v-dragula="attackCharacters" bag="party-bag">
            <li
              class=""
              v-for="c in attackCharacters"
              :key="c.tokenId"
              @click="$emit('input', c.tokenId)"
            >
              <img class="character-img nes-pointer"
                :src="require(`@/assets/character/${ c.name.split(' ')[0] }.png`)"
                v-tooltip.right="detailTooltipHtml(c)" />
            </li>
          </ul>
          <div class="total-power">
            Total ATK: {{ getTotalATK(attackCharacters) }}
          </div>
        </div>
        <div class="nes-container with-title is-centered party mt-4">
          <p class="title">Deffence: {{ memberCount('defence') }}</p>
          <ul class="character-list defence" v-dragula="defenceCharacters" bag="party-bag">
            <li
              class=""
              v-for="c in defenceCharacters"
              :key="c.tokenId"
              @click="$emit('input', c.tokenId)"
            >
              <img class="character-img nes-pointer"
                :src="require(`@/assets/character/${ c.name.split(' ')[0] }.png`)"
                v-tooltip.right="detailTooltipHtml(c)" />
            </li>
          </ul>
          <div class="total-power">
            Total DEF: {{ getTotalDEF(defenceCharacters) }}
          </div>
        </div>
        <div class="nes-container with-title is-centered party mt-4">
          <p class="title">Explore</p>
          <ul class="character-list explore" v-dragula="exploreCharacters" bag="party-bag">
            <li
              class=""
              v-for="c in exploreCharacters"
              :key="c.tokenId"
              @click="$emit('input', c.tokenId)"
            >
              <img class="character-img nes-pointer"
                :src="require(`@/assets/character/${ c.name.split(' ')[0] }.png`)"
                v-tooltip.right="detailTooltipHtml(c)" />
            </li>
          </ul>
          <div class="total-power">
            Total LUK: {{ getTotalLUK(exploreCharacters) }}
          </div>
        </div>
      </div>
    </div>
    <equipments></equipments>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import NavBar from './components/NavBar.vue';
import Equipments from './components/Equipments.vue';

export default {
  inject: ['web3'],
  components: {
    NavBar,
    Equipments,
  },

  data: () => ({
    errorMessage: '',
    attackCharacters: [],
    defenceCharacters: [],
    exploreCharacters: [],
  }),

  computed: {
    ...mapState(['defaultAccount', 'ownedCharacters', 'ownedWeapons', 'ownedArmors']),

    detailTooltipHtml() {
      return function(c) {
        let html = `<strong>${c.name}</strong> (${ c.GenerationType })<br>`;
        html += `Level: <strong>${ c.Level }</strong><br>`;
        html += `ATK: <strong>${ c.ATK }</strong><br>`;
        html += `DEF: <strong>${ c.DEF }</strong><br>`;
        html += `LUK: <strong>${ c.LUK }</strong><br>`;
        html += `<strong>${ c.Species }</strong><br>`;
        html += `<strong>${ c.Heritage }</strong><br>`;
        html += `<strong>${ c.Personality }</strong><br>`;
        return html;
      };
    },

    memberCount() {
      return function(party) {
        let characters;
        if(party === 'attack') characters = this.attackCharacters;
        if(party === 'defence') characters = this.defenceCharacters;
        if(party === 'explore') characters = this.exploreCharacters;
        let member = 30; // default
        for(let i = 0; i < characters.length; i++) {
          member += (10 + characters[i].Level - 1);
        }
        return member;

      };
    },

  },

  methods: {
    getTotalATK(party) {
      let total = 0;
      for(let i = 0; i < party.length; i++) {
        const equipments = this.ownedWeapons.filter((e) => e.Type === party[i].Weapon);
        console.log(equipments);
        equipments.forEach(e => {
          total += party[i].ATK * e.Lv * (Number(e.hold) + 1);
        });
      }
      return total;

    },
    getTotalDEF(party) {
      let total = 0;
      for(let i = 0; i < party.length; i++) {
        const equipments = this.ownedArmors.filter((e) => e.Type === party[i].Armor);
        equipments.forEach(e => {
          total += party[i].DEF * e.Lv * (Number(e.hold) + 1);
        });
      }
      return total;

    },
    getTotalLUK(party) {
      let total = 0;
      for(let i = 0; i < party.length; i++) {
        total += party[i].LUK;
      }
      return total;

    },
    autoParty() {

    }
  },

  created: () => {
    Vue.vueDragula.eventBus.$on('drop', function (args) {
      console.log(args);
    });
  }
};
</script>

<style scoped>

.party {
  width: 508px;
  height: 175px;
}
.character.selected {
  box-shadow: 0 0 30px #4faaff;
}

/* .character-img {
  display: inline-block;
  text-align: right;
} */

.character-img {
  width: 96px;
  height: 96px;
}

.character-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: grid;
  padding: 0.5px;
  grid-template-columns: repeat(auto-fit, 5em);
  gap: 3px;
}


@media (max-width: 576px) {
  .character-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
