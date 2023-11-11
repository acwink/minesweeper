<script setup lang="ts" generic="T extends any, O extends any">
import MineBlock from '~/components/MineBlock.vue'
import type { BlockState } from '~/types'
import { isDev, toggleDev } from '~/composables'

const WITDH = 5
const HIGHT = 5
const state = ref(
  Array.from({ length: HIGHT }, (_, y) => Array.from({ length: WITDH }, (_, x): BlockState => ({
    x,
    y,
    adjacentMines: 0,
    revealed: false,
    flagged: false,
  }))),
)

function generateMines(initial: BlockState) {
  for (const row of state.value) {
    for (const bolck of row) {
      if (Math.abs(initial.x - bolck.x) < 1 || Math.abs(initial.y - bolck.y) < 1)
        continue
      bolck.mine = Math.random() < 0.2
    }
  }
}

const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, 1],
  [0, -1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
]

function updateNumbers() {
  state.value.forEach((row) => {
    row.forEach((block) => {
      if (block.mine)
        return
      getSiblings(block).forEach((b) => {
        if (b.mine)
          block.adjacentMines += 1
      })
    })
  })
}

function expendZero(block: BlockState) {
  block.revealed = true
  if (block.adjacentMines)
    return

  getSiblings(block).forEach((s) => {
    if (!s.revealed)
      expendZero(s)
  })
}

let mineGenerated = false

function onRightClick(block: BlockState) {
  if (block.revealed)
    return
  block.flagged = !block.flagged
}

function onClick(block: BlockState) {
  if (block.flagged)
    return

  if (!mineGenerated) {
    generateMines(block)
    updateNumbers()
    mineGenerated = true
  }

  if (block.mine) {
    block.revealed = true
    alert('BOOOOM!')
    return
  }

  expendZero(block)
}

function getSiblings(block: BlockState) {
  return directions.map(([dx, dy]) => {
    const x2 = block.x + dx
    const y2 = block.y + dy

    if (x2 < 0 || x2 >= WITDH || y2 < 0 || y2 >= HIGHT)
      return undefined

    return state.value[y2][x2]
  })
    .filter(Boolean) as BlockState[]
}

function checkGameState() {
  const blocks = state.value.flat()
  if (blocks.every(block => block.revealed || block.flagged)) {
    if (blocks.some(block => block.flagged && !block.mine))
      alert('You cheat!')
    else
      alert('You win!')
  }
}

watch(state, checkGameState, { deep: true })
</script>

<template>
  <div @contextmenu.prevent>
    Minesweeper
    <button @click="() => toggleDev()">
      {{ isDev }}
    </button>
    <div p5>
      <div v-for="row, y in state" :key="y" flex="~" items-center justify-center>
        <div v-for="block, x in row" :key="x">
          <MineBlock
            :block="block"
            @click="onClick(block)"
            @contextmenu.prevent="onRightClick(block)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
