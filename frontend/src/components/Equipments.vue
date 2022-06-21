<template>
  <div class="equipments">
    <div class="row mt-5">
      <div class="col col-sm-7 col-md-7 col-lg-7 ml-5 mr-3 nes-container with-title is-centered">
        <p class="title">Your Weapons</p>
        <div class="row">
          <div class="col mx-1 nes-container with-title is-centered">
            <p class="title">Level 1</p>
            <ul class="weapon-list owned">
              <li
                class=""
                v-for="e in weapons"
                :key="e.name"
              >
                <img class="weapon-img"
                  :src="e.image" />
                  {{ e.name }}:
                <div class="weapon" v-if="ownedWeapons && ownedWeapons.length > 0">
                  <input type="text" class="input-param"
                    v-model="ownedWeapons.filter((w) => w.name === e.name && w.level === 1)[0].hold" />
                </div>
              </li>
            </ul>
          </div>
          <div class="col mx-1 nes-container with-title is-centered">
            <p class="title">Level 2</p>
            <ul class="weapon-list owned">
              <li
                class=""
                v-for="e in weapons"
                :key="e.name"
              >
                <img class="weapon-img"
                  :src="e.image" />
                  {{ e.name }}:
                <div class="weapon" v-if="ownedWeapons && ownedWeapons.length > 0">
                  <input type="text" class="input-param"
                    v-model="ownedWeapons.filter((w) => w.name === e.name && w.level === 2)[0].hold" />
                </div>
              </li>
            </ul>
          </div>
          <div class="col mx-1 nes-container with-title is-centered">
            <p class="title">Level 3</p>
            <ul class="weapon-list owned">
              <li
                class=""
                v-for="e in weapons"
                :key="e.name"
              >
                <img class="weapon-img"
                  :src="e.image" />
                  {{ e.name }}:
                <div class="weapon" v-if="ownedWeapons && ownedWeapons.length > 0">
                  <input type="text" class="input-param"
                    v-model="ownedWeapons.filter((w) => w.name === e.name && w.level === 3)[0].hold" />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="row mt-5 ml-4">
      <div class="col col-sm-8 col-md-8 col-lg-8 ml-2 nes-container with-title is-centered">
        <p class="title">Your Armors</p>
        <div class="row">
          <div class="col mx-1 nes-container with-title is-centered">
            <p class="title">Level 1</p>
            <ul class="armor-list owned">
              <li
                class=""
                v-for="e in armors"
                :key="e.name"
              >
                <img class="armor-img"
                  :src="e.image" />
                  {{ e.name }}:
                <div class="weapon" v-if="ownedArmors && ownedArmors.length > 0">
                  <input type="text" class="input-param"
                    v-model="ownedArmors.filter((w) => w.name === e.name && w.level === 1)[0].hold" />
                </div>
              </li>
            </ul>
          </div>
          <div class="col mx-1 nes-container with-title is-centered">
            <p class="title">Level 2</p>
            <ul class="armor-list owned">
              <li
                class=""
                v-for="e in armors"
                :key="e.name"
              >
                <img class="armor-img"
                  :src="e.image" />
                  {{ e.name }}:
                <div class="weapon" v-if="ownedArmors && ownedArmors.length > 0">
                  <input type="text" class="input-param"
                    v-model="ownedArmors.filter((w) => w.name === e.name && w.level === 2)[0].hold" />
                </div>
              </li>
            </ul>
          </div>
          <div class="col mx-1 nes-container with-title is-centered">
            <p class="title">Level 3</p>
            <ul class="armor-list owned">
              <li
                class=""
                v-for="e in armors"
                :key="e.name"
              >
                <img class="armor-img"
                  :src="e.image" />
                  {{ e.name }}:
                <div class="weapon" v-if="ownedArmors && ownedArmors.length > 0">
                  <input type="text" class="input-param"
                    v-model="ownedArmors.filter((w) => w.name === e.name && w.level === 3)[0].hold" />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import equipments from '@/assets/equipment/equipments.js';

export default {
  data: () => ({
    weapons: [],
    armors: [],
  }),

  mounted() {
    this.weapons = equipments.weapons;
    this.armors = equipments.armors;
  },

  computed: {
    ...mapState(['ownedWeapons', 'ownedArmors']),

  },

  methods: {

  },

};
</script>


<style scoped>
.weapon-list {
  list-style-type: none;
  text-align: left;
}

.weapon {
  text-align: right;
}

.weapon-img {
  width: 30px;
  height: 30px;
}

.armor-list {
  list-style-type: none;
  text-align: left;
}

.armor-img {
  width: 30px;
  height: 30px;
}

.input-param {
  width: 80px;
  text-align: right;
}
</style>


