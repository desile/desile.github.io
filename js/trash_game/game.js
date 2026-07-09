class TrashGame {
    constructor() {
        this.icons = [
            { emoji: '📄', name: 'Document', points: 10 },
            { emoji: '📝', name: 'Notepad', points: 10 },
            { emoji: '🖼️', name: 'Picture', points: 15 },
            { emoji: '📊', name: 'Excel', points: 15 },
            { emoji: '📁', name: 'Folder', points: 20 },
            { emoji: '💾', name: 'Floppy', points: 25 },
            { emoji: '📀', name: 'CD-ROM', points: 25 },
            { emoji: '🎵', name: 'Music', points: 20 },
            { emoji: '🎮', name: 'Game', points: 30 },
            { emoji: '⚙️', name: 'Settings', points: 35 },
            { emoji: '🔧', name: 'Tools', points: 30 },
            { emoji: '📧', name: 'Email', points: 15 },
            { emoji: '🌐', name: 'Internet', points: 20 },
            { emoji: '🖨️', name: 'Printer', points: 25 },
            { emoji: '💿', name: 'DVD', points: 30 }
        ];
        
        this.score = 0;
        this.throws = 0;
        this.hits = 0;
        this.level = 1;
        this.currentIcon = null;
        this.isDragging = false;
        this.dragStartPos = { x: 0, y: 0 };
        this.dragCurrentPos = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.lastPositions = [];
        this.gameActive = true;
        
        this.initElements();
        this.initEventListeners();
        this.startNewGame();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }
    
    initElements() {
        this.iconTray = document.getElementById('icon-tray');
        this.gameArea = document.getElementById('game-area');
        this.recycleBin = document.getElementById('recycle-bin');
        this.scoreEl = document.getElementById('score');
        this.throwsEl = document.getElementById('throws');
        this.accuracyEl = document.getElementById('accuracy');
        this.levelEl = document.getElementById('level');
        this.statusText = document.getElementById('status-text');
        this.scorePopup = document.getElementById('score-popup');
        this.popupIcon = document.getElementById('popup-icon');
        this.popupText = document.getElementById('popup-text');
        this.dialogOverlay = document.getElementById('dialog-overlay');
        this.finalScore = document.getElementById('final-score');
        this.finalAccuracy = document.getElementById('final-accuracy');
        this.finalLevel = document.getElementById('final-level');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.nextIconBtn = document.getElementById('next-icon-btn');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.dialogClose = document.getElementById('dialog-close');
        this.clock = document.getElementById('clock');
    }
    
    initEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.nextIconBtn.addEventListener('click', () => this.spawnIcons());
        this.playAgainBtn.addEventListener('click', () => this.closeDialog());
        this.dialogClose.addEventListener('click', () => this.closeDialog());
        
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }
    
    updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        this.clock.textContent = `${hours}:${minutes}`;
    }
    
    startNewGame() {
        this.score = 0;
        this.throws = 0;
        this.hits = 0;
        this.level = 1;
        this.gameActive = true;
        this.dialogOverlay.classList.remove('show');
        this.updateUI();
        this.spawnIcons();
        this.statusText.textContent = 'Ready to play! Drag an icon and throw it into the Recycle Bin.';
    }
    
    closeDialog() {
        this.dialogOverlay.classList.remove('show');
        this.startNewGame();
    }
    
    spawnIcons() {
        this.iconTray.innerHTML = '';
        
        const numIcons = Math.min(3 + Math.floor(this.level / 2), 5);
        const shuffled = [...this.icons].sort(() => Math.random() - 0.5);
        const selectedIcons = shuffled.slice(0, numIcons);
        
        selectedIcons.forEach((icon, index) => {
            const iconEl = document.createElement('div');
            iconEl.className = 'draggable-icon';
            iconEl.innerHTML = `
                <div class="icon-img">${icon.emoji}</div>
                <div class="icon-label">${icon.name}</div>
            `;
            iconEl.dataset.points = icon.points;
            iconEl.dataset.emoji = icon.emoji;
            iconEl.dataset.name = icon.name;
            
            iconEl.addEventListener('mousedown', (e) => this.onMouseDown(e, iconEl));
            iconEl.addEventListener('touchstart', (e) => this.onTouchStart(e, iconEl), { passive: false });
            
            this.iconTray.appendChild(iconEl);
        });
    }
    
    onMouseDown(e, iconEl) {
        if (!this.gameActive) return;
        e.preventDefault();
        this.startDrag(iconEl, e.clientX, e.clientY);
    }
    
    onTouchStart(e, iconEl) {
        if (!this.gameActive) return;
        e.preventDefault();
        const touch = e.touches[0];
        this.startDrag(iconEl, touch.clientX, touch.clientY);
    }
    
    startDrag(iconEl, x, y) {
        this.isDragging = true;
        this.currentIcon = iconEl.cloneNode(true);
        this.currentIcon.classList.add('dragging');
        this.currentIcon.style.left = (x - 32) + 'px';
        this.currentIcon.style.top = (y - 32) + 'px';
        this.currentIcon.dataset.points = iconEl.dataset.points;
        this.currentIcon.dataset.emoji = iconEl.dataset.emoji;
        this.currentIcon.dataset.name = iconEl.dataset.name;
        document.body.appendChild(this.currentIcon);
        
        this.dragStartPos = { x, y };
        this.dragCurrentPos = { x, y };
        this.lastPositions = [{ x, y, time: Date.now() }];
        
        iconEl.style.opacity = '0.3';
        this.originalIcon = iconEl;
        
        this.statusText.textContent = `Dragging ${iconEl.dataset.name}... Release to throw!`;
    }
    
    onMouseMove(e) {
        if (!this.isDragging || !this.currentIcon) return;
        this.updateDrag(e.clientX, e.clientY);
    }
    
    onTouchMove(e) {
        if (!this.isDragging || !this.currentIcon) return;
        e.preventDefault();
        const touch = e.touches[0];
        this.updateDrag(touch.clientX, touch.clientY);
    }
    
    updateDrag(x, y) {
        this.dragCurrentPos = { x, y };
        this.currentIcon.style.left = (x - 32) + 'px';
        this.currentIcon.style.top = (y - 32) + 'px';
        
        this.lastPositions.push({ x, y, time: Date.now() });
        if (this.lastPositions.length > 5) {
            this.lastPositions.shift();
        }
        
        this.createTrail(x, y);
        
        const binRect = this.recycleBin.getBoundingClientRect();
        const isOverBin = x > binRect.left && x < binRect.right && 
                         y > binRect.top && y < binRect.bottom;
        
        if (isOverBin) {
            this.recycleBin.classList.add('highlight');
        } else {
            this.recycleBin.classList.remove('highlight');
        }
    }
    
    createTrail(x, y) {
        const trail = document.createElement('div');
        trail.className = 'trail';
        trail.style.left = (x - 5) + 'px';
        trail.style.top = (y - 5) + 'px';
        document.body.appendChild(trail);
        
        setTimeout(() => trail.remove(), 300);
    }
    
    onMouseUp(e) {
        if (!this.isDragging) return;
        this.endDrag(e.clientX, e.clientY);
    }
    
    onTouchEnd(e) {
        if (!this.isDragging) return;
        this.endDrag(this.dragCurrentPos.x, this.dragCurrentPos.y);
    }
    
    endDrag(x, y) {
        this.isDragging = false;
        this.recycleBin.classList.remove('highlight');
        
        if (this.lastPositions.length >= 2) {
            const recent = this.lastPositions.slice(-3);
            const first = recent[0];
            const last = recent[recent.length - 1];
            const timeDiff = (last.time - first.time) / 1000;
            
            if (timeDiff > 0) {
                this.velocity = {
                    x: (last.x - first.x) / timeDiff * 0.015,
                    y: (last.y - first.y) / timeDiff * 0.015
                };
            }
        }
        
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        
        if (speed > 2) {
            this.throwIcon(x, y);
        } else {
            this.cancelThrow();
        }
    }
    
    cancelThrow() {
        if (this.currentIcon) {
            this.currentIcon.remove();
            this.currentIcon = null;
        }
        if (this.originalIcon) {
            this.originalIcon.style.opacity = '1';
            this.originalIcon = null;
        }
        this.statusText.textContent = 'Throw cancelled. Try again with more speed!';
    }
    
    throwIcon(startX, startY) {
        this.throws++;
        
        const icon = this.currentIcon;
        const points = parseInt(icon.dataset.points);
        const emoji = icon.dataset.emoji;
        const name = icon.dataset.name;
        
        icon.classList.remove('dragging');
        icon.classList.add('flying-icon');
        
        let posX = startX - 32;
        let posY = startY - 32;
        let velX = this.velocity.x;
        let velY = this.velocity.y;
        const gravity = 0.5;
        const friction = 0.99;
        
        const binRect = this.recycleBin.getBoundingClientRect();
        const binCenterX = binRect.left + binRect.width / 2;
        const binCenterY = binRect.top + binRect.height / 2;
        
        const animate = () => {
            velY += gravity;
            velX *= friction;
            velY *= friction;
            
            posX += velX;
            posY += velY;
            
            icon.style.left = posX + 'px';
            icon.style.top = posY + 'px';
            icon.style.transform = `rotate(${velX * 5}deg)`;
            
            const iconCenterX = posX + 32;
            const iconCenterY = posY + 32;
            
            const distToBin = Math.sqrt(
                (iconCenterX - binCenterX) ** 2 + 
                (iconCenterY - binCenterY) ** 2
            );
            
            if (distToBin < 50) {
                this.onHit(icon, points, emoji, name);
                return;
            }
            
            if (posY > window.innerHeight || posX < -100 || posX > window.innerWidth + 100) {
                this.onMiss(icon, name);
                return;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
        
        if (this.originalIcon) {
            this.originalIcon.remove();
            this.originalIcon = null;
        }
        
        this.currentIcon = null;
    }
    
    onHit(icon, points, emoji, name) {
        icon.remove();
        this.hits++;
        
        const levelBonus = Math.floor(this.level / 2) * 5;
        const totalPoints = points + levelBonus;
        this.score += totalPoints;
        
        this.recycleBin.classList.add('success');
        setTimeout(() => this.recycleBin.classList.remove('success'), 300);
        
        this.showPopup(emoji, `+${totalPoints}`, false);
        this.statusText.textContent = `${name} deleted! +${totalPoints} points!`;
        
        this.updateUI();
        this.checkLevelUp();
        this.checkIconTray();
    }
    
    onMiss(icon, name) {
        icon.style.transition = 'opacity 0.3s';
        icon.style.opacity = '0';
        setTimeout(() => icon.remove(), 300);
        
        this.showPopup('❌', 'Miss!', true);
        this.statusText.textContent = `${name} missed the Recycle Bin!`;
        
        this.updateUI();
        this.checkIconTray();
    }
    
    showPopup(emoji, text, isMiss) {
        const binRect = this.recycleBin.getBoundingClientRect();
        
        this.scorePopup.style.left = (binRect.left + binRect.width / 2) + 'px';
        this.scorePopup.style.top = (binRect.top) + 'px';
        this.popupIcon.textContent = emoji;
        this.popupText.textContent = text;
        this.popupText.className = 'popup-text' + (isMiss ? ' miss' : '');
        
        this.scorePopup.classList.remove('show');
        void this.scorePopup.offsetWidth;
        this.scorePopup.classList.add('show');
        
        setTimeout(() => this.scorePopup.classList.remove('show'), 1000);
    }
    
    updateUI() {
        this.scoreEl.textContent = this.score;
        this.throwsEl.textContent = this.throws;
        this.levelEl.textContent = this.level;
        
        const accuracy = this.throws > 0 ? Math.round((this.hits / this.throws) * 100) : 0;
        this.accuracyEl.textContent = accuracy + '%';
    }
    
    checkLevelUp() {
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.statusText.textContent = `🎉 Level Up! Now at Level ${this.level}!`;
            this.updateUI();
        }
    }
    
    checkIconTray() {
        const remainingIcons = this.iconTray.querySelectorAll('.draggable-icon');
        if (remainingIcons.length === 0) {
            if (this.throws >= 20) {
                this.endGame();
            } else {
                setTimeout(() => this.spawnIcons(), 500);
            }
        }
    }
    
    endGame() {
        this.gameActive = false;
        const accuracy = this.throws > 0 ? Math.round((this.hits / this.throws) * 100) : 0;
        
        this.finalScore.textContent = this.score;
        this.finalAccuracy.textContent = accuracy + '%';
        this.finalLevel.textContent = this.level;
        
        setTimeout(() => {
            this.dialogOverlay.classList.add('show');
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TrashGame();
});
