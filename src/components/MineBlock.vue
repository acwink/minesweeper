<script setup lang="ts">
import type { BlockState } from '~/types'
import { isDev } from '~/composables'

defineProps<{ block: BlockState }>()

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

function getBlockClass(block: BlockState) {
  if (block.flagged)
    return 'bg-red-500/10'

  if (!block.revealed)
    return 'bg-gray-500/10 hover:bg-gray/10'

  return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines]
}
</script>

<template>
  <button
    min-h-8 min-w-8
    m="1px"
    flex="~"
    items-center justify-center
    border="0.5 gray-400/10"
    :class="getBlockClass(block)"
  >
    <template v-if="block.flagged">
      <div i-mdi-flag text-red />
    </template>
    <template v-if="block.revealed || isDev">
      <div v-if="block.mine" i-mdi-mine />
      <div v-else font-600>
        {{ block.adjacentMines }}
      </div>
    </template>
  </button>
</template>
