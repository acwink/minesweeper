<script setup lang="ts" generic="T extends any, O extends any">
interface BlockState {
  x: number
  y: number
  revealed?: boolean
  mine?: boolean
  flagged?: boolean
  adjacentMines: number
}

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

const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-red-500',
  'text-purple-500',
  'text-yellow-500',
  'text-pink-500',
  'text-indigo-500',
  'text-gray-500',
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
const dev = false

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

function getBlockClass(block: BlockState) {
  if (block.flagged)
    return 'bg-red-500/10'

  if (!block.revealed)
    return 'bg-gray-500/10 hover:bg-gray/10'

  return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines]
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

    <div p5>
      <div v-for="row, y in state" :key="y" flex="~" items-center justify-center>
        <button
          v-for="block, x in row"
          :key="x"
          flex="~"
          m="0.5"
          h-10 w-10
          items-center justify-center
          border="1 gray-400/10"
          :class="getBlockClass(block)"
          @click="onClick(block)"
          @contextmenu.prevent="onRightClick(block)"
        >
          <template v-if="block.flagged">
            <div i-mdi-flag text-red />
          </template>
          <template v-if="block.revealed || dev">
            <div v-if="block.mine" i-mdi-mine />
            <div v-else>
              {{ block.adjacentMines }}
            </div>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
