let deck = [];
let MiddlePile = [];
const dealNumber = 7;
let Player1 = { name: 'Player1', number: 1, hand: [], cardsPlayedThisTurn: false };
let Player2 = { name: 'Player2', number: 2, hand: [], cardsPlayedThisTurn: false };
let Players = [Player1, Player2];
let currentPlayer = Player1;
let inactivePlayer = Player2;
let waitState = false;

window.onload = function () {
  buildDeck();
  shuffleDeck();
  deal();
};

function buildDeck() {
  let values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let types = ['C', 'D', 'H', 'S'];

  for (let i = 0; i < types.length; i++) {
    for (let j = 0; j < values.length; j++) {
      deck.push(values[j] + '-' + types[i]);
    }
  }
  console.log(deck);
}

function shuffleDeck() {
  // for (let i = 0; i < deck.length; i++) {
  //   let j = Math.floor(Math.random() * deck.length);
  //   let temp = deck[i];
  //   deck[i] = deck[j];
  //   deck[j] = temp;
  // }
  console.log(deck);
}

function deal() {
  //Foreach Player Deal a 7 card hand
  Players.forEach((player) => {
    let cards = document.querySelectorAll(`.hand.p${player.number} > img`);
    for (let i = 0; i < dealNumber; i++) {
      let card = deck.pop();
      player.hand.push(card);

      let cardImg = document.createElement('img');
      cardImg.src = './cards/' + card + '.png';
      cardImg.id = card;
      cards[i].replaceWith(cardImg);
    }
    console.log(`Hand ${player.name}: ${player.hand}`);
  });
  //play a card face up
  let faceUpCard = deck.pop();
  MiddlePile.push(faceUpCard);
  console.log(`Pile: ${MiddlePile}`);
  let faceup = document.getElementById('pile-card');
  let cardImg = document.createElement('img');
  cardImg.src = './cards/' + faceUpCard + '.png';
  cardImg.id = `pile-card`;
  faceup.replaceWith(cardImg);
  // Check Face Up card is not a trick, deal another if its a trick
  while (isTrickCard(faceUpCard)) {
    faceUpCard = deck.pop();
    MiddlePile.push(faceUpCard);
    console.log(`New FaceUp Card: ${faceUpCard}`);
    console.log(`Pile: ${MiddlePile}`);
    faceup = document.getElementById('pile-card');
    cardImg = document.createElement('img');
    cardImg.src = './cards/' + faceUpCard + '.png';
    cardImg.id = `pile-card`;
    faceup.replaceWith(cardImg);
  }

  disableHand(inactivePlayer);
  disableNonPlayableCards(Player1);
  document.getElementById('currentTurn').textContent = Player1.name;

  document.getElementById('dealBtn').addEventListener('click', dealFromStack);
  document.getElementById('endTurn').addEventListener('click', changePlayer);
}

function playCardFromHand(e) {
  console.log('play Card From Hand');
  let card = e.target.id;

  //remove from current hand
  currentPlayer.hand = currentPlayer.hand.filter((item) => item !== card);
  document.getElementById(card).remove();

  //Add to middle pile;
  MiddlePile.push(card);
  console.log(`New FaceUp Card: ${card}`);
  console.log(`Pile: ${MiddlePile}`);
  faceup = document.getElementById('pile-card');
  cardImg = document.createElement('img');
  cardImg.src = './cards/' + card + '.png';
  cardImg.id = `pile-card`;
  faceup.replaceWith(cardImg);
  currentPlayer.cardsPlayedThisTurn = true;

  eightOrWait(card);
  disableNonPlayableCards(currentPlayer);
}

function changePlayer() {
  console.log('EndTurn');
  if (currentPlayer.number === 1) {
    currentPlayer = Player2;
    inactivePlayer = Player1;
  } else {
    currentPlayer = Player1;
    inactivePlayer = Player2;
  }
  document.getElementById('currentTurn').textContent = currentPlayer.name;

  disableHand(inactivePlayer);
  currentPlayer.cardsPlayedThisTurn = false;

  enableHand(currentPlayer);
  disableNonPlayableCards(currentPlayer);
}

function disableNonPlayableCards(currentPlayer) {
  let activeHand = document.querySelector(`.hand.p${currentPlayer.number}`);
  activeHand.classList += ' active';

  let allCards = document.querySelectorAll(`.hand.p${currentPlayer.number} > img`);
  let cards = currentPlayer.hand;
  for (let i = 0; i < cards.length; i++) {
    if (canCardBePlayed(cards[i], MiddlePile.at(-1))) {
      console.log(`playable = ${cards[i]}`);
      allCards[i].classList = 'playable';
    } else {
      console.log(`disabled = ${cards[i]}`);
      allCards[i].classList = 'disabled';
    }
  }

  let playables = document.querySelectorAll('.playable');
  playables.forEach((element) => {
    element.addEventListener('click', playCardFromHand);
  });
}

function disableHand(inactivePlayer) {
  let DisabledHand = document.querySelector(`.hand.p${inactivePlayer.number}`);
  DisabledHand.classList.remove('active');
  let disableCards = document.querySelectorAll(`.hand.p${inactivePlayer.number} > img`);
  for (let i = 0; i < disableCards.length; i++) {
    disableCards[i].classList = 'disabled';
  }
}

function enableHand(activePlayer) {
  let activeHand = document.querySelector(`.hand.p${activePlayer.number}`);
  activeHand.classList.remove('disabled');
  let disableCards = document.querySelectorAll(`.hand.p${activePlayer.number} > img`);
  for (let i = 0; i < disableCards.length; i++) {
    disableCards[i].classList.remove('disabled');
  }
}

function dealFromStack() {
  console.log('deal From Stack');
  let hand = document.querySelector(`.hand.p${currentPlayer.number}`);
  let node = document.createElement('img');
  let card = deck.pop();
  currentPlayer.hand.push(card);
  node.src = './cards/' + card + '.png';
  node.id = card;
  if (canCardBePlayed(card, MiddlePile.at(-1))) {
    console.log(`playable = ${card}`);
    node.classList = 'playable';
  } else {
    console.log(`disabled = ${card}`);
    node.classList = 'disabled';
  }

  hand.appendChild(node);
  let playables = document.querySelectorAll('.playable');
  playables.forEach((element) => {
    element.addEventListener('click', playCardFromHand);
  });
  //if last card remove centre face down card
  if (deck.length == 0) {
    document.getElementById('dealBtn').remove();
  }
}

function isTrickCard(card) {
  if (card[0] == 'A') {
    return true;
  } else if (card[0] == 'J') {
    return true;
  } else if (card[0] == '2') {
    return true;
  } else if (card[0] == '8') {
    return true;
  } else {
    return false;
  }
}

function eightOrWait(card) {
  if (card[0] == '8') {
    waitState = true;
    let eightArry = ['8-H', '8-D', '8-C', '8-S'];
    //if 8 is played other player can only play a 8 to ask 8 or wait
    if (inactivePlayer.hand.some((r) => eightArry.includes(r))) {
      changePlayer();
    }
  } else {
    waitState = false;
  }
}

function canCardBePlayed(cardsValues, pileCard) {
  console.log(`currentPlayer.cardsPlayedThisTurn = ${currentPlayer.cardsPlayedThisTurn}`);
  let values = cardsValues.split('-');
  let Piles = pileCard.split('-');
  console.log(`Values = ${values}`);
  console.log(`Piles = ${Piles}`);
  console.log(`waitState = ${waitState}`);

  //If you are on a question like 8 or wait or 2 or pick up 2
  if (waitState) {
    if (Piles[0] === '8' && values[0] == '8') {
      return true;
    } else if (Piles[0] === '8' && values[0] != '8') {
      return false;
    }
  }
  //If You already played a card only allow suited connectors
  else if (currentPlayer.cardsPlayedThisTurn) {
    //If you played an ace allow all cards
    if (Piles[0] === 'A') {
      return true;
    }
    //If Suit the same as pile card allow connectors
    if (values[1] === Piles[1]) {
      let numValues = parseInt(values[0]);
      let pileValues = parseInt(Piles[0]);

      if ((Piles[0] === 'K' && values[0] === 'Q') || (Piles[0] === 'K' && values[0] === 'A')) {
        return true;
      } else if ((Piles[0] === 'Q' && values[0] === 'J') || (Piles[0] === 'Q' && values[0] === 'K')) {
        return true;
      } else if ((Piles[0] === 'J' && values[0] === 'Q') || (Piles[0] === 'J' && values[0] === '10')) {
        return true;
      } else if ((pileValues === 2 && values[0] === 'A') || (Piles[0] === 'A' && numValues === 2)) {
        if (currentPlayer.hand.length === 2) {
          return false;
        } else {
          return true;
        }
      } else if (pileValues != NaN) {
        if (pileValues === numValues + 1) {
          return true;
        } else if (pileValues === numValues - 1) {
          return true;
        }
      }
    }
  }
  //If it your First Card
  else {
    //Should Not end up with an Empty Ace in the middle on your first turn
    if (values[0] === 'A' && currentPlayer.hand.length > 2) {
      return true;
    }
    //Can't Ace it to last Card
    if (values[0] === 'A' && currentPlayer.hand.length <= 2) {
      return false;
    } else if (Piles[0] === '8') {
      let eightArry = ['8-H', '8-D', '8-C', '8-S'];

      return true;
    } else if (Piles[0] === 'J') {
      return true;
    } else if (Piles[0] === '2') {
      return true;
    } else if (values[0] === Piles[0]) {
      return true;
    } else if (values[1] === Piles[1]) {
      return true;
    } else {
      return false;
    }
  }
}
