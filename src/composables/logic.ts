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

interface GameState {
  board: BlockState[][]
  mineGenerated: boolean
  gameState: 'play' | 'won' | 'lose'
}

export class GamePlay {
  state = ref<GameState>() as Ref<GameState>
  constructor(public width: number, public height: number) {
    this.reset()
  }

  get board() {
    return this.state.value?.board
  }

  reset() {
    this.state.value = {
      gameState: 'play',
      mineGenerated: false,
      board: Array.from({ length: this.height }, (_, y) => Array.from({ length: this.width }, (_, x): BlockState => ({
        x,
        y,
        adjacentMines: 0,
        revealed: false,
        flagged: false,
      }))),
    }
  }

  generateMines(initial: BlockState) {
    for (const row of this.board) {
      for (const bolck of row) {
        if (Math.abs(initial.x - bolck.x) < 1 || Math.abs(initial.y - bolck.y) < 1)
          continue
        bolck.mine = Math.random() < 0.2
      }
    }
    this.updateNumbers()
  }

  updateNumbers() {
    this.board.forEach((row) => {
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
    if (block.adjacentMines || block.flagged)
      return

    this.getSiblings(block)
      .forEach((s) => {
        if (!s.revealed)
          this.expendZero(s)
      })
  }

  onRightClick(block: BlockState) {
    if (this.state.value.gameState !== 'play')
      return
    if (block.revealed)
      return
    block.flagged = !block.flagged
  }

  onClick(block: BlockState) {
    if (this.state.value.gameState !== 'play')
      return
    if (block.flagged)
      return

    if (!this.state.value.mineGenerated) {
      this.generateMines(block)
      this.state.value.mineGenerated = true
    }

    if (block.mine) {
      this.state.value.gameState = 'lose'
      this.showAllMines()
      setTimeout(() => {
        alert('Booom!')
      })
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

      return this.board[y2][x2]
    })
      .filter(Boolean) as BlockState[]
  }

  showAllMines() {
    this.board.flat().forEach((block) => {
      if (block.mine) {
        block.flagged = false
        block.revealed = true
      }
    })
  }

  checkGameState() {
    const blocks = this.board.flat()
    if (blocks.every(block => block.revealed || block.flagged)) {
      if (blocks.some(block => block.flagged && !block.mine)) { alert('You cheat!') }
      else {
        this.state.value.gameState = 'won'
        alert('You win!')
      }
    }
  }
}
