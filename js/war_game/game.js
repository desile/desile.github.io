class WarGame {
    constructor() {
        this.suits = ['♠', '♣', '♥', '♦'];
        this.ranks = ['6', '7', '8', '9', '10', 'В', 'Д', 'К', 'Т'];
        this.rankValues = {
            '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'В': 11, 'Д': 12, 'К': 13, 'Т': 14
        };
        
        this.playerDeck = [];
        this.computerDeck = [];
        this.warPile = [];
        this.isAutoPlay = false;
        this.autoPlayInterval = null;
        this.gameOver = false;
        
        this.initElements();
        this.initEventListeners();
        this.startNewGame();
    }
    
    initElements() {
        this.playerCardsEl = document.getElementById('player-cards');
        this.computerCardsEl = document.getElementById('computer-cards');
        this.playerPlayedEl = document.getElementById('player-played');
        this.computerPlayedEl = document.getElementById('computer-played');
        this.warPileEl = document.getElementById('war-pile');
        this.battleMessageEl = document.getElementById('battle-message');
        this.playBtn = document.getElementById('play-btn');
        this.autoBtn = document.getElementById('auto-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.modal = document.getElementById('game-over-modal');
        this.winnerText = document.getElementById('winner-text');
        this.winnerMessage = document.getElementById('winner-message');
        this.newGameBtn = document.getElementById('new-game-btn');
    }
    
    initEventListeners() {
        this.playBtn.addEventListener('click', () => this.playRound());
        this.autoBtn.addEventListener('click', () => this.toggleAutoPlay());
        this.restartBtn.addEventListener('click', () => this.startNewGame());
        this.newGameBtn.addEventListener('click', () => {
            this.modal.classList.remove('show');
            this.startNewGame();
        });
    }
    
    createDeck() {
        const deck = [];
        for (const suit of this.suits) {
            for (const rank of this.ranks) {
                deck.push({ suit, rank, value: this.rankValues[rank] });
            }
        }
        return deck;
    }
    
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }
    
    startNewGame() {
        this.stopAutoPlay();
        this.gameOver = false;
        this.warPile = [];
        
        const deck = this.shuffleDeck(this.createDeck());
        const half = Math.floor(deck.length / 2);
        this.playerDeck = deck.slice(0, half);
        this.computerDeck = deck.slice(half);
        
        this.updateUI();
        this.clearPlayedCards();
        this.battleMessageEl.textContent = 'Нажмите "Играть" чтобы начать!';
        this.playBtn.disabled = false;
    }
    
    updateUI() {
        this.playerCardsEl.textContent = this.playerDeck.length;
        this.computerCardsEl.textContent = this.computerDeck.length;
    }
    
    createCardElement(card, isBack = false) {
        const cardEl = document.createElement('div');
        
        if (isBack) {
            cardEl.className = 'card card-back';
        } else {
            const isRed = card.suit === '♥' || card.suit === '♦';
            cardEl.className = `card card-front ${isRed ? 'red' : 'black'}`;
            cardEl.innerHTML = `
                <span class="card-rank">${card.rank}</span>
                <span class="card-suit">${card.suit}</span>
            `;
        }
        
        return cardEl;
    }
    
    clearPlayedCards() {
        this.playerPlayedEl.innerHTML = '<div class="card placeholder"></div>';
        this.computerPlayedEl.innerHTML = '<div class="card placeholder"></div>';
        this.warPileEl.innerHTML = '';
    }
    
    async playRound() {
        if (this.gameOver) return;
        if (this.playerDeck.length === 0 || this.computerDeck.length === 0) {
            this.endGame();
            return;
        }
        
        this.playBtn.disabled = true;
        this.clearPlayedCards();
        
        const playerCard = this.playerDeck.shift();
        const computerCard = this.computerDeck.shift();
        
        const playerCardEl = this.createCardElement(playerCard);
        const computerCardEl = this.createCardElement(computerCard);
        
        playerCardEl.classList.add('flip');
        computerCardEl.classList.add('flip');
        
        this.playerPlayedEl.innerHTML = '';
        this.computerPlayedEl.innerHTML = '';
        this.playerPlayedEl.appendChild(playerCardEl);
        this.computerPlayedEl.appendChild(computerCardEl);
        
        await this.delay(400);
        
        this.warPile.push(playerCard, computerCard);
        
        if (playerCard.value > computerCard.value) {
            this.battleMessageEl.textContent = `${playerCard.rank}${playerCard.suit} > ${computerCard.rank}${computerCard.suit} — Вы выиграли раунд!`;
            playerCardEl.classList.add('winner');
            await this.delay(600);
            this.playerDeck.push(...this.shuffleDeck([...this.warPile]));
            this.warPile = [];
        } else if (computerCard.value > playerCard.value) {
            this.battleMessageEl.textContent = `${playerCard.rank}${playerCard.suit} < ${computerCard.rank}${computerCard.suit} — Компьютер выиграл раунд!`;
            computerCardEl.classList.add('winner');
            await this.delay(600);
            this.computerDeck.push(...this.shuffleDeck([...this.warPile]));
            this.warPile = [];
        } else {
            this.battleMessageEl.textContent = `${playerCard.rank}${playerCard.suit} = ${computerCard.rank}${computerCard.suit} — ВОЙНА!`;
            playerCardEl.classList.add('war');
            computerCardEl.classList.add('war');
            await this.delay(600);
            await this.handleWar();
        }
        
        this.updateUI();
        
        if (this.playerDeck.length === 0 || this.computerDeck.length === 0) {
            this.endGame();
        } else {
            this.playBtn.disabled = false;
        }
    }
    
    async handleWar() {
        this.warPileEl.innerHTML = '';
        
        const cardsToPlace = Math.min(
            1,
            this.playerDeck.length - 1,
            this.computerDeck.length - 1
        );
        
        if (cardsToPlace < 0) {
            if (this.playerDeck.length === 0) {
                this.computerDeck.push(...this.shuffleDeck([...this.warPile]));
            } else {
                this.playerDeck.push(...this.shuffleDeck([...this.warPile]));
            }
            this.warPile = [];
            return;
        }
        
        for (let i = 0; i < cardsToPlace; i++) {
            const pCard = this.playerDeck.shift();
            const cCard = this.computerDeck.shift();
            this.warPile.push(pCard, cCard);
            
            const pBackEl = this.createCardElement(pCard, true);
            const cBackEl = this.createCardElement(cCard, true);
            pBackEl.style.width = '50px';
            pBackEl.style.height = '70px';
            cBackEl.style.width = '50px';
            cBackEl.style.height = '70px';
            this.warPileEl.appendChild(pBackEl);
            this.warPileEl.appendChild(cBackEl);
        }
        
        this.battleMessageEl.textContent = `В банке ${this.warPile.length} карт!`;
        await this.delay(500);
        
        if (this.playerDeck.length === 0 || this.computerDeck.length === 0) {
            if (this.playerDeck.length === 0) {
                this.computerDeck.push(...this.shuffleDeck([...this.warPile]));
            } else {
                this.playerDeck.push(...this.shuffleDeck([...this.warPile]));
            }
            this.warPile = [];
            return;
        }
        
        const playerCard = this.playerDeck.shift();
        const computerCard = this.computerDeck.shift();
        this.warPile.push(playerCard, computerCard);
        
        const playerCardEl = this.createCardElement(playerCard);
        const computerCardEl = this.createCardElement(computerCard);
        
        playerCardEl.classList.add('flip');
        computerCardEl.classList.add('flip');
        
        this.playerPlayedEl.innerHTML = '';
        this.computerPlayedEl.innerHTML = '';
        this.playerPlayedEl.appendChild(playerCardEl);
        this.computerPlayedEl.appendChild(computerCardEl);
        
        await this.delay(400);
        
        if (playerCard.value > computerCard.value) {
            this.battleMessageEl.textContent = `${playerCard.rank}${playerCard.suit} > ${computerCard.rank}${computerCard.suit} — Вы выиграли войну и ${this.warPile.length} карт!`;
            playerCardEl.classList.add('winner');
            await this.delay(600);
            this.playerDeck.push(...this.shuffleDeck([...this.warPile]));
            this.warPile = [];
            this.warPileEl.innerHTML = '';
        } else if (computerCard.value > playerCard.value) {
            this.battleMessageEl.textContent = `${playerCard.rank}${playerCard.suit} < ${computerCard.rank}${computerCard.suit} — Компьютер выиграл войну и ${this.warPile.length} карт!`;
            computerCardEl.classList.add('winner');
            await this.delay(600);
            this.computerDeck.push(...this.shuffleDeck([...this.warPile]));
            this.warPile = [];
            this.warPileEl.innerHTML = '';
        } else {
            this.battleMessageEl.textContent = 'Снова равенство! Ещё одна война!';
            playerCardEl.classList.add('war');
            computerCardEl.classList.add('war');
            await this.delay(600);
            await this.handleWar();
        }
    }
    
    toggleAutoPlay() {
        if (this.isAutoPlay) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }
    
    startAutoPlay() {
        if (this.gameOver) return;
        this.isAutoPlay = true;
        this.autoBtn.textContent = '⏸️ Стоп';
        this.autoBtn.classList.add('active');
        this.playBtn.disabled = true;
        
        this.autoPlayInterval = setInterval(() => {
            if (!this.gameOver && this.playerDeck.length > 0 && this.computerDeck.length > 0) {
                this.playRound();
            } else {
                this.stopAutoPlay();
            }
        }, 1500);
    }
    
    stopAutoPlay() {
        this.isAutoPlay = false;
        this.autoBtn.textContent = '⚡ Авто-игра';
        this.autoBtn.classList.remove('active');
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        if (!this.gameOver) {
            this.playBtn.disabled = false;
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.stopAutoPlay();
        this.playBtn.disabled = true;
        
        if (this.playerDeck.length > this.computerDeck.length) {
            this.winnerText.textContent = '🎉 Поздравляем!';
            this.winnerMessage.textContent = 'Вы победили! Все карты ваши!';
        } else if (this.computerDeck.length > this.playerDeck.length) {
            this.winnerText.textContent = '😔 Игра окончена';
            this.winnerMessage.textContent = 'Компьютер победил. Попробуйте ещё раз!';
        } else {
            this.winnerText.textContent = '🤝 Ничья!';
            this.winnerMessage.textContent = 'Невероятно! Игра закончилась вничью!';
        }
        
        setTimeout(() => {
            this.modal.classList.add('show');
        }, 500);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WarGame();
});
