// Simple Mobile-Only Game Implementation

// Game State
const gameState = {
    // Resources
    resources: {
        compute: 50,
        energy: 50,
        talent: 50,
        knowledge: 50,
        progress: 0,
        trust: 50,
        capital: 50,
        alignment: 50
    },
    
    // Game progress
    currentTurn: 1,
    maxTurns: 40,
    currentPhase: 1,
    currentDate: { month: 1, year: 2025 },
    
    // Personal stats
    netWorth: 5000000, // $5M starting
    legacy: "Ambitious",
    
    // Cards
    currentCard: null,
    cardsPlayed: [],
    
    // Flags
    flags: {
        alignmentVisible: false,
        gameOver: false
    }
};

// DOM Elements
const elements = {
    // Header
    date: document.getElementById('date'),
    turn: document.getElementById('turn'),
    
    // Resources
    computeBar: document.getElementById('compute-bar'),
    computeValue: document.getElementById('compute-value'),
    energyBar: document.getElementById('energy-bar'),
    energyValue: document.getElementById('energy-value'),
    talentBar: document.getElementById('talent-bar'),
    talentValue: document.getElementById('talent-value'),
    knowledgeBar: document.getElementById('knowledge-bar'),
    knowledgeValue: document.getElementById('knowledge-value'),
    progressBar: document.getElementById('progress-bar'),
    progressValue: document.getElementById('progress-value'),
    trustBar: document.getElementById('trust-bar'),
    trustValue: document.getElementById('trust-value'),
    capitalBar: document.getElementById('capital-bar'),
    capitalValue: document.getElementById('capital-value'),
    alignmentBar: document.getElementById('alignment-bar'),
    alignmentValue: document.getElementById('alignment-value'),
    alignmentContainer: document.getElementById('alignment-container'),
    
    // Card
    card: document.getElementById('card'),
    cardHeader: document.getElementById('card-header'),
    cardTitle: document.getElementById('card-title'),
    cardDescription: document.getElementById('card-description'),
    
    // Buttons
    choiceLeft: document.getElementById('choice-left'),
    choiceLeftText: document.getElementById('choice-left-text'),
    choiceRight: document.getElementById('choice-right'),
    choiceRightText: document.getElementById('choice-right-text'),
    
    // Personal stats
    netWorth: document.getElementById('net-worth'),
    legacy: document.getElementById('legacy'),
    
    // Modal
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalClose: document.getElementById('modal-close')
};

// Game Data (simplified subset)
const gameData = {
    cards: [],
    crisisEvents: [],
    config: {
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        phases: {
            1: { name: "Stumbling Agents", startTurn: 1 },
            2: { name: "Expensive AI", startTurn: 11 },
            3: { name: "Automation Surge", startTurn: 21 },
            4: { name: "Singularity Approaching", startTurn: 31 }
        }
    }
};

// Initialize Game
async function init() {
    try {
        // Load game data
        await loadGameData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Start game
        updateUI();
        showNextCard();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showModal('Error', 'Failed to load game data. Please refresh the page.');
    }
}

// Load game data from JSON files
async function loadGameData() {
    try {
        const [cardsData, crisisData, configData] = await Promise.all([
            fetch('src/data/cards.json').then(r => r.json()),
            fetch('src/data/crisisEvents.json').then(r => r.json()),
            fetch('src/data/gameConfig.json').then(r => r.json())
        ]);
        
        gameData.cards = cardsData.cards;
        gameData.crisisEvents = crisisData.crisisEvents;
        Object.assign(gameData.config, configData);
    } catch (error) {
        throw new Error('Failed to load game data');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Button clicks
    elements.choiceLeft.addEventListener('click', () => makeChoice('left'));
    elements.choiceRight.addEventListener('click', () => makeChoice('right'));
    
    // Modal close
    elements.modalClose.addEventListener('click', closeModal);
    
    // Simple swipe detection
    let touchStartX = 0;
    let touchEndX = 0;
    
    elements.card.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });
    
    elements.card.addEventListener('touchmove', (e) => {
        touchEndX = e.touches[0].clientX;
        const diff = touchEndX - touchStartX;
        
        // Visual feedback during swipe
        if (Math.abs(diff) > 30) {
            elements.card.style.transform = `translateX(${diff * 0.5}px) rotate(${diff * 0.05}deg)`;
            
            if (diff < -50) {
                elements.card.classList.add('swiping-left');
                elements.card.classList.remove('swiping-right');
            } else if (diff > 50) {
                elements.card.classList.add('swiping-right');
                elements.card.classList.remove('swiping-left');
            } else {
                elements.card.classList.remove('swiping-left', 'swiping-right');
            }
        }
    });
    
    elements.card.addEventListener('touchend', (e) => {
        const diff = touchEndX - touchStartX;
        
        // Reset card position
        elements.card.style.transform = '';
        elements.card.classList.remove('swiping-left', 'swiping-right');
        
        // Trigger choice if swipe was significant
        if (diff < -100) {
            makeChoice('left');
        } else if (diff > 100) {
            makeChoice('right');
        }
    });
}

// Update UI
function updateUI() {
    // Update header
    const monthName = gameData.config.months[gameState.currentDate.month - 1];
    elements.date.textContent = `${monthName} ${gameState.currentDate.year}`;
    elements.turn.textContent = `Turn ${gameState.currentTurn}/${gameState.maxTurns}`;
    
    // Update resources
    updateResource('compute');
    updateResource('energy');
    updateResource('talent');
    updateResource('knowledge');
    updateResource('progress');
    updateResource('trust');
    updateResource('capital');
    
    if (gameState.flags.alignmentVisible) {
        elements.alignmentContainer.style.display = 'flex';
        updateResource('alignment');
    }
    
    // Update personal stats
    elements.netWorth.textContent = formatMoney(gameState.netWorth);
    elements.legacy.textContent = gameState.legacy;
}

// Update single resource
function updateResource(name) {
    const value = Math.max(0, Math.min(100, gameState.resources[name]));
    const bar = elements[`${name}Bar`];
    const valueEl = elements[`${name}Value`];
    
    bar.style.width = `${value}%`;
    valueEl.textContent = Math.round(value);
    
    // Color coding
    bar.classList.remove('critical', 'warning', 'healthy');
    if (value <= 20) {
        bar.classList.add('critical');
    } else if (value <= 40) {
        bar.classList.add('warning');
    } else if (value >= 80) {
        bar.classList.add('healthy');
    }
}

// Show next card
function showNextCard() {
    if (gameState.flags.gameOver) return;
    
    // Get available cards for current phase
    const phaseCards = gameData.cards.filter(card => 
        card.phase === gameState.currentPhase && 
        !gameState.cardsPlayed.includes(card.id)
    );
    
    if (phaseCards.length === 0) {
        endGame('No more cards available');
        return;
    }
    
    // Pick random card
    const card = phaseCards[Math.floor(Math.random() * phaseCards.length)];
    gameState.currentCard = card;
    
    // Display card
    elements.cardHeader.textContent = card.header || 'Decision';
    elements.cardTitle.textContent = card.title;
    
    // Handle description (can be string or array)
    const description = Array.isArray(card.description) 
        ? card.description.map(p => `<p>${p}</p>`).join('')
        : `<p>${card.description}</p>`;
    elements.cardDescription.innerHTML = description;
    
    // Set choice buttons
    elements.choiceLeftText.textContent = card.choices.left.text;
    elements.choiceRightText.textContent = card.choices.right.text;
    
    // Animate card entry
    elements.card.style.opacity = '0';
    elements.card.style.transform = 'translateY(20px)';
    setTimeout(() => {
        elements.card.style.opacity = '1';
        elements.card.style.transform = 'translateY(0)';
    }, 10);
}

// Make choice
function makeChoice(direction) {
    if (!gameState.currentCard || gameState.flags.gameOver) return;
    
    const choice = gameState.currentCard.choices[direction];
    
    // Apply resource changes
    if (choice.effects) {
        Object.entries(choice.effects).forEach(([resource, change]) => {
            if (gameState.resources.hasOwnProperty(resource)) {
                gameState.resources[resource] += change;
                gameState.resources[resource] = Math.max(0, Math.min(100, gameState.resources[resource]));
            }
        });
    }
    
    // Apply special effects
    if (choice.special) {
        applySpecialEffects(choice.special);
    }
    
    // Update personal stats
    if (choice.effects?.capital) {
        gameState.netWorth += choice.effects.capital * 1000000; // Each capital point = $1M
    }
    
    if (choice.legacy) {
        gameState.legacy = choice.legacy;
    }
    
    // Mark card as played
    gameState.cardsPlayed.push(gameState.currentCard.id);
    
    // Progress turn
    progressTurn();
    
    // Check win/lose conditions
    if (checkGameEnd()) return;
    
    // Update UI and show next card
    updateUI();
    setTimeout(() => showNextCard(), 300);
}

// Apply special effects
function applySpecialEffects(effects) {
    Object.entries(effects).forEach(([key, value]) => {
        switch (key) {
            case 'setFlag':
                gameState.flags[value] = true;
                break;
            case 'multiply':
                Object.entries(value).forEach(([resource, multiplier]) => {
                    if (gameState.resources.hasOwnProperty(resource)) {
                        gameState.resources[resource] *= multiplier;
                    }
                });
                break;
        }
    });
}

// Progress turn
function progressTurn() {
    gameState.currentTurn++;
    
    // Progress date
    gameState.currentDate.month++;
    if (gameState.currentDate.month > 12) {
        gameState.currentDate.month = 1;
        gameState.currentDate.year++;
    }
    
    // Check phase transition
    Object.entries(gameData.config.phases).forEach(([phase, data]) => {
        if (gameState.currentTurn === data.startTurn) {
            gameState.currentPhase = parseInt(phase);
        }
    });
    
    // Apply feedback loops (simplified)
    applyFeedbackLoops();
}

// Apply feedback loops
function applyFeedbackLoops() {
    const r = gameState.resources;
    
    // Research loop: (Compute + Talent) × Energy% → Progress
    if (r.energy > 20) {
        const researchPower = (r.compute + r.talent) / 2;
        const energyMultiplier = r.energy / 100;
        r.progress += (researchPower * energyMultiplier * 0.1);
    }
    
    // Capital generation: (Trust × Progress) / 200 → Capital
    r.capital += (r.trust * r.progress) / 2000;
    
    // Energy consumption
    r.energy -= (r.compute * 0.05);
    
    // Clamp all resources
    Object.keys(r).forEach(key => {
        r[key] = Math.max(0, Math.min(100, r[key]));
    });
}

// Check game end conditions
function checkGameEnd() {
    const r = gameState.resources;
    
    // Win condition
    if (r.progress >= 100) {
        if (r.alignment >= 70) {
            endGame('Victory! You achieved aligned AGI.');
        } else {
            endGame('Catastrophe! Unaligned AGI has been unleashed.');
        }
        return true;
    }
    
    // Lose conditions
    if (r.compute <= 0 || r.energy <= 0) {
        endGame('Game Over: Critical infrastructure failure.');
        return true;
    }
    
    if (r.trust <= 0) {
        endGame('Game Over: Complete loss of public trust.');
        return true;
    }
    
    if (r.capital <= 0) {
        endGame('Game Over: Bankruptcy.');
        return true;
    }
    
    if (gameState.currentTurn >= gameState.maxTurns) {
        endGame('Game Over: A competitor achieved AGI first.');
        return true;
    }
    
    return false;
}

// End game
function endGame(message) {
    gameState.flags.gameOver = true;
    
    const finalStats = `
        <p>${message}</p>
        <p><strong>Final Stats:</strong></p>
        <p>Progress: ${Math.round(gameState.resources.progress)}%</p>
        <p>Net Worth: ${formatMoney(gameState.netWorth)}</p>
        <p>Legacy: ${gameState.legacy}</p>
        <p>Turns: ${gameState.currentTurn}</p>
    `;
    
    showModal('Game Over', finalStats);
}

// Show modal
function showModal(title, content) {
    elements.modalTitle.textContent = title;
    elements.modalBody.innerHTML = content;
    elements.modal.style.display = 'flex';
}

// Close modal
function closeModal() {
    elements.modal.style.display = 'none';
    
    if (gameState.flags.gameOver) {
        // Reload page to restart
        location.reload();
    }
}

// Format money
function formatMoney(amount) {
    if (amount >= 1000000000) {
        return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(0)}M`;
    } else {
        return `$${amount.toLocaleString()}`;
    }
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', init);