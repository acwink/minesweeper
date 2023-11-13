<script setup lang="ts" generic="T extends any, O extends any">
import MineBlock from '~/components/MineBlock.vue'
import { isDev, toggleDev } from '~/composables'

const play = new GamePlay(5, 5, 10)
const now = useNow()
const timerMS = computed(() => Math.round((+now.value - +play.state.value.startMS) / 1000))

useStorage('vuesweeper', play.state)
const state = computed(() => play.board)

function newGame(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      play.reset(9, 9, 10)
      break
    case 'medium':
      play.reset(16, 16, 40)
      break
    case 'hard':
      play.reset(16, 30, 99)
      break
  }
}

const mineCount = computed(() => {
  if (!play.state.value.mineGenerated)
    return play.mines
  return play.blocks.reduce((a, b) => (b.mine ? a + 1 : a), 0)
})

watchEffect(() => play.checkGameState())
</script>

<template>
  <div @contextmenu.prevent>
    Minesweeper

    <div flex="~ gap1" justify-center p4>
      <button btn @click="play.reset()">
        NEW GAME
      </button>
      <button btn @click="newGame('easy')">
        Easy
      </button>
      <button btn @click="newGame('medium')">
        Medium
      </button>
      <button btn @click="newGame('hard')">
        Hard
      </button>
    </div>

    <div flex="~ gap-8" justify-center>
      <div flex="~ gap-1" items-center text-2xl font-mono>
        <div i-carbon-timer />
        {{ timerMS }}
      </div>
      <div flex="~ gap-1" items-center text-2xl font-mono>
        <div i-mdi-mine />
        {{ mineCount }}
      </div>
    </div>

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
      Count: {{ mineCount }}
    </div>

    <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">
        {{ isDev ? 'DEB' : 'NORMAL' }}
      </button>
    </div>

    <Confetti :passed="play.state.value.gameState === 'won'" />
  </div>
</template>
