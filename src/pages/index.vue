<script setup lang="ts" generic="T extends any, O extends any">
import MineBlock from '~/components/MineBlock.vue'
import { isDev, toggleDev } from '~/composables'

const play = new GamePlay(5, 5)
useStorage('vuesweeper', play.state)
const state = computed(() => play.board)
watchEffect(() => play.checkGameState())
</script>

<template>
  <div @contextmenu.prevent>
    Minesweeper

    <div p5>
      <div v-for="row, y in state" :key="y" flex="~" items-center justify-center>
        <div v-for="block, x in row" :key="x">
          <MineBlock
            :block="block"
            @click="play.onClick(block)"
            @contextmenu.prevent="play.onRightClick(block)"
          />
        </div>
      </div>
    </div>

    <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">
        {{ isDev ? 'DEB' : 'NORMAL' }}
      </button>
      <button btn @click="play.reset()">
        REST
      </button>
    </div>
  </div>
</template>
