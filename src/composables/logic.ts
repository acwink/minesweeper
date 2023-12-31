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
  gameState: 'play' | 'won' | 'lost'
  startMS: number
}

export class GamePlay {
  state = ref<GameState>() as Ref<GameState>
  constructor(public width: number, public height: number, public mines: number) {
    this.reset()
  }

  get board() {
    return this.state.value?.board
  }

  get blocks() {
    return this.state.value.board.flat()
  }

  reset(
    width: number = this.width,
    height: number = this.height,
    mines: number = this.mines,
  ) {
    this.width = width
    this.height = height
    this.mines = mines

    this.state.value = {
      gameState: 'play',
      mineGenerated: false,
      board: Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x): BlockState => ({
        x,
        y,
        adjacentMines: 0,
        revealed: false,
        flagged: false,
      }))),
      startMS: +Date.now(),
    }
  }

  random(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  randomInt(min: number, max: number) {
    return Math.round(this.random(min, max))
  }

  generateMines(initial: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      if (Math.abs(initial.x - x) < 1 && Math.abs(initial.y - y) < 1)
        return false
      this.board[y][x].mine = true
      return true
    }
    Array
      .from({ length: this.mines }, () => null)
      .forEach (() => {
        while (!placeRandom());
      })
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
        if (!s.revealed && !s.flagged)
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
      this.showAllMines()
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
    // 如果点击了炸弹，游戏结束
    if (blocks.some(block => block.revealed && block.mine)) {
      this.state.value.gameState = 'lost'
      this.showAllMines()
      return
    }

    // 如果所有的炸弹都被标记，游戏结束
    if (blocks.every(block => block.revealed || block.flagged)) {
      if (blocks.some(block => block.flagged && !block.mine)) {
        this.state.value.gameState = 'lost'
        this.showAllMines()
      }
      else {
        this.state.value.gameState = 'won'
      }
    }
  }

  autoExpand(block: BlockState) {
    const siblings = this.getSiblings(block)
    const flags = siblings.reduce((a, b) => a + (b.flagged ? 1 : 0), 0)
    if (flags === block.adjacentMines) {
      siblings.forEach((i) => {
        i.revealed = true
      })
    }
  }
}
