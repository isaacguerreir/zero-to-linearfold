class Weights {
  static get paired() {
    return 1
  }

  static get unpaired() {
    return -0.1
  }
}

enum Structs {
  OPEN_BRACKET = "(",
  CLOSE_BRACKET = ")",
  DOT = "."
}

interface StateProps {
  x: string
  y: string
  sigma: Array<number>
  j: number
  score: number
}

class State {
  _x: string
  _y: string
  _sigma: Array<number>
  _j: number
  _score: number
  _allowedPairs = ["CG", "GC", "AU", "UA", "GU", "UG"]

  static default = {
    x: "",
    y: "",
    sigma: [],
    j: -1,
    score: 0
  }

  constructor({ x, y, sigma, j, score }: StateProps) {
    this._x = x
    this._y = y
    this._sigma = sigma
    this._j = j
    this._score = score
  }

  get score() {
    return this._score
  }

  get sigma() {
    return this._sigma
  }

  getLast() {
    return this._sigma[this._sigma.length - 1]
  }

  push() {
    return new State({
      x: this._x,
      y: this._y + Structs.OPEN_BRACKET,
      sigma: [...this._sigma, this._j + 1],
      j: this._j + 1,
      score: this._score
    })._balance()
  }

  skip() {
    return new State({
      x: this._x,
      y: this._y + Structs.DOT,
      sigma: [...this._sigma],
      j: this._j + 1,
      score: this._score + Weights.unpaired
    })._balance()
  }

  pop() {
    const valid = this._validPairs(this.getLast(), this._j + 1)
    if (valid) {
      return new State({
        x: this._x,
        y: this._y + Structs.CLOSE_BRACKET,
        sigma: this._sigma.slice(0, -1),
        j: this._j + 1,
        score: this._score + Weights.paired
      })._balance()
    }
  }

  next(currentStates: Array<State>) {
    const states: Array<State> = [...currentStates]
    let state = this.push(states)
    if (state) states.push(state)

    state = this.skip(states)
    if (state) states.push(state)

    state = this.pop(states)
    if (state) states.push(state)

    return states
  }

  private _

  private _sameStack(a: Array<number>, b: Array<number>) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

  private _validPairs(i: number, j: number) {
    if (i !== undefined && j !== undefined) {
      const iNuc = this._x.charAt(i)
      const jNuc = this._x.charAt(j)

      return this._allowedPairs.includes(iNuc+jNuc)
    } 
  }

  private _balance() {
    const openBrackets = (this._y.match(/\(/g) || []).length
    const closeBrackets = (this._y.match(/\)/g) || []).length
    const leftOpenBrackets = openBrackets - closeBrackets
    const leftOptions = this._x.length - this._y.length

    // console.log('log: ', JSON.stringify(this))
    if (leftOptions >= leftOpenBrackets) return this 
  }
}

const sequence = "CCAGG"

let states: Array<State> = [new State({ ...State.default, x: sequence })]

for (let position = 0; position < sequence.length; position++) {
  const nextStates: Array<State> = [] 

  for (let state of states) {
    nextStates.push(...state.next(nextStates))
  }

  states = nextStates.sort((a, b) => a.score - b.score)
}

console.log(states[states.length - 1])
