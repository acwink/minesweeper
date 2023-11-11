import type { BlockState } from '~/types'

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

export class GamePlay {
  state = ref<BlockState[][]>([])
  mineGenerated = false

  constructor(public width: number, public height: number) {
    this.reset()
  }

  reset() {
    this.mineGenerated = false
    this.state.value = Array.from({ length: this.height }, (_, y) => Array.from({ length: this.width }, (_, x): BlockState => ({
      x,
      y,
      adjacentMines: 0,
      revealed: false,
      flagged: false,
    })))
  }

  generateMines(initial: BlockState) {
    for (const row of this.state.value) {
      for (const bolck of row) {
        if (Math.abs(initial.x - bolck.x) < 1 || Math.abs(initial.y - bolck.y) < 1)
          continue
        bolck.mine = Math.random() < 0.2
      }
    }
    this.updateNumbers()
  }

  updateNumbers() {
    this.state.value.forEach((row) => {
      row.forEach((block) => {
        if (block.mine)
          return
        this.getSiblings(block).forEach((b) => {
          if (b.mine)
            block.adjacentMines += 1
        })
      })
    })
  }

  expendZero(block: BlockState) {
    block.revealed = true
    if (block.adjacentMines)
      return

    this.getSiblings(block)
      .forEach((s) => {
        if (!s.revealed)
          this.expendZero(s)
      })
  }

  onRightClick(block: BlockState) {
    if (block.revealed)
      return
    block.flagged = !block.flagged
  }

  onClick(block: BlockState) {
    if (block.flagged)
      return

    if (!this.mineGenerated) {
      this.generateMines(block)
      this.mineGenerated = true
    }

    if (block.mine) {
      block.revealed = true
      alert('BOOOOM!')
      return
    }

    this.expendZero(block)
  }

  getSiblings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy

      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined

      return this.state.value[y2][x2]
    })
      .filter(Boolean) as BlockState[]
  }

  checkGameState() {
    const blocks = this.state.value.flat()
    if (blocks.every(block => block.revealed || block.flagged)) {
      if (blocks.some(block => block.flagged && !block.mine))
        alert('You cheat!')
      else
        alert('You win!')
    }
  }
}
