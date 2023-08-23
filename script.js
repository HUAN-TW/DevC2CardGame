// 牌背樣式：https://assets-lighthouse.alphacamp.co/uploads/image/file/9222/ExportedContentImage_00.png
// 黑桃花色：https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png
// 紅心花色：https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png
// 方塊花色：https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png
// 梅花花色：https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png
// 遊戲圖示：https://assets-lighthouse.alphacamp.co/uploads/image/file/17990/__.png
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished',
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png', // 梅花
]

const utilitys = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let i = number.length - 1; i >= 0; i--) {
      let randomIndex = Math.floor(Math.random() * (i + 1))
      ;[number[i], number[randomIndex]] = [number[randomIndex], number[i]]
    }
    return number
  },
}

const view = {
  getCardElement(index) {
    return `<div class="card back" data-index=${index}></div>`
  },
  getCardContent(index) {
    //接到的input 要再區分花色與是否要換文字
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
            <p>${number}</p>
            <img src="${symbol}" />
            <p>${number}</p>
         `
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  flipCards(...card) {
    card.map((card) => {
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(card.dataset.index)
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    //選染出卡牌 -> 可以傳入數字給卡牌
    // 將52丟入getRandomNumberArray 在透過map 將每個元素添加element
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join('')
  },
  pairCard(...cards) {
    cards.map((card) => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector(
      '.tried'
    ).textContent = `You've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add('wrong')
      card.addEventListener(
        'animationend',
        (event) => event.target.classList.remove('wrong'),
        { once: true }
      )
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utilitys.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (card.classList.contains('.back')) {
      return
    }
    switch (this.currentState) {
      //翻牌 -->推進revealedCards -->更改狀態
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          view.renderScore((model.score += 10))
          // 配對成功
          this.currentState = GAME_STATE.CardsMatched
          //加狀態

          view.pairCard(...model.revealedCards)
          //清空revealedCards
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished() // 加在這裡
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          view.appendWrongAnimation(...model.revealedCards)
          this.currentState = GAME_STATE.CardsMatchFailed
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log(
      'revealedCards',
      model.revealedCards.map((card) => card.dataset.index)
    )
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
}

const model = {
  revealedCards: [],
  score: 0,
  triedTimes: 0,
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    )
  },
}

controller.generateCards()

document
  .querySelectorAll('.card')
  .forEach((card) =>
    card.addEventListener('click', (event) =>
      controller.dispatchCardAction(event.target)
    )
  )
