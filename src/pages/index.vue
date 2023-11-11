<script setup lang="ts" generic="T extends any, O extends any">
import MineBlock from '~/components/MineBlock.vue'
import { isDev, toggleDev } from '~/composables'

const play = new GamePlay(5, 5, 10)
useStorage('vuesweeper', play.state)
const state = computed(() => play.board)
watchEffect(() => play.checkGameState())

const mineCount = computed(() => {
  return play.blocks.reduce((a, b) => (b.mine ? a + 1 : a), 0)
})
</script>

<template>
  <div @contextmenu.prevent>
    Minesweeper

    <div w-full overflow-auto p5>
      <div v-for="row, y in state" :key="y" flex="~" ma w-max items-center justify-center>
        <div v-for="block, x in row" :key="x">
          <MineBlock
            :block="block"
            @click="play.onClick(block)"
            @contextmenu.prevent="play.onRightClick(block)"
          />
        </div>
      </div>
    </div>

    <div>
      {{ mineCount }}
    </div>

    <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">
        {{ isDev ? 'DEB' : 'NORMAL' }}
      </button>
      <button btn @click="play.reset()">
        REST
      </button>
    </div>

    <Confetti :passed="play.state.value.gameState === 'won'" />
  </div>
</template>
