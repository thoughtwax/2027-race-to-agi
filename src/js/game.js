// Main Game Logic Module
const Game = {
    isInitialized: false,
    
    // Initialize game
    async init() {
        // Load game data
        const cardsLoaded = await Cards.loadCardsData();
        const crisisLoaded = await Crisis.loadCrisisData();
        
        if (!cardsLoaded || !crisisLoaded) {
            console.error('Failed to load game data');
            return false;
        }
        
        // Always start fresh game
        GameState.reset();
        
        // Initialize UI
        UI.init();
        
        // Initialize drag handlers
        Cards.initDragHandlers();
        
        // Update all displays
        Resources.updateAll();
        
        // Set initialized flag
        this.isInitialized = true;
        
        // Show the app
        document.getElementById('app').style.opacity = '1';
        document.getElementById('app').style.transition = 'opacity 0.3s ease';
        
        // Start first turn
        this.nextTurn();
        
        return true;
    },
    
    
    // Progress to next turn
    nextTurn() {
        // Show tutorial card on first turn
        if (GameState.current.turnCount === 0 && Cards.cardsData.tutorial) {
            Cards.currentCard = Cards.cardsData.tutorial;
            Cards.displayCard(Cards.cardsData.tutorial);
            return;
        }
        
        // Check for crisis event first
        const crisis = Crisis.checkForCrisis();
        
        if (crisis) {
            // Show crisis alert
            Crisis.showCrisisAlert(crisis);
            
            // Display crisis as next card
            Cards.currentCard = crisis;
            Cards.displayCard(crisis);
            
            // Mark as urgent
            document.getElementById('current-card').classList.add('urgent');
        } else {
            // Get and display normal card
            const card = Cards.getNextCard();
            Cards.displayCard(card);
        }
        
        // No saving - removed save state
    },
    
    // Progress turn after decision
    progressTurn() {
        GameState.current.turnCount++;
        GameState.current.decisionsSinceNewspaper++;
        
        // Advance date
        GameState.advanceDate();
        UI.updateDate();
        
        // Apply feedback loops
        Resources.applyFeedbackLoops();
        
        // Progress competitor
        const progressRate = GameState.current.flags.chinaAggressive ? 
            Config.game.competitorAggressiveRate : 
            Config.game.competitorProgressRate;
        GameState.current.competitorProgress += progressRate;
        
        // Check for phase transition
        const phaseEvent = GameState.checkPhaseTransition();
        if (phaseEvent) {
            UI.showEvent(phaseEvent);
            UI.updatePhase();
        }
        
        // Check end conditions
        const ending = GameState.checkEndConditions();
        if (ending) {
            this.endGame(ending);
            return;
        }
        
        // Check for newspaper
        if (GameState.current.decisionsSinceNewspaper >= Config.game.newspaperInterval) {
            GameState.current.decisionsSinceNewspaper = 0;
            this.showNewspaper();
        } else {
            // Continue to next turn with delay for animations and consequence text
            setTimeout(() => {
                this.nextTurn();
            }, 2200); // Allow consequence text to complete (2000ms) + brief pause
        }
        
        // Show warnings
        UI.showCompetitorWarning();
        
        // No saving
    },
    
    // Show newspaper interstitial
    showNewspaper() {
        // Show newspaper through UI
        UI.showNewspaper();
    },
    
    // Generate newspaper content
    generateNewspaperContent() {
        const state = GameState.current;
        
        // Get crisis headlines if available
        const crisisHeadlines = Crisis.getNewspaperHeadlines();
        
        // Main headline - use crisis headline if available
        let mainHeadline;
        if (crisisHeadlines.length > 0) {
            mainHeadline = {
                title: crisisHeadlines[0],
                subtitle: this.generateSubtitle()
            };
        } else {
            // Default headlines based on state
            if (state.phase === 4) {
                mainHeadline = {
                    title: 'THE SINGULARITY IS NEAR',
                    subtitle: 'Experts warn AGI could arrive within months'
                };
            } else if (state.resources.trust < 30) {
                mainHeadline = {
                    title: 'PUBLIC TRUST CRISIS',
                    subtitle: 'Citizens demand oversight of AI development'
                };
            } else if (state.resources.progress > 70) {
                mainHeadline = {
                    title: 'BREAKTHROUGH IMMINENT',
                    subtitle: 'OpenBrain leads race to artificial general intelligence'
                };
            } else if (state.flags.chinaAggressive) {
                mainHeadline = {
                    title: 'GLOBAL AI ARMS RACE',
                    subtitle: 'Nations compete for technological supremacy'
                };
            } else {
                mainHeadline = {
                    title: 'AI RACE CONTINUES',
                    subtitle: 'Tech giants push boundaries of artificial intelligence'
                };
            }
        }
        
        return {
            main: mainHeadline,
            articles: [
                this.generateSideArticle('tech'),
                this.generateSideArticle('social')
            ],
            crisisHeadlines: crisisHeadlines.slice(1, 3)
        };
    },
    
    // Generate subtitle based on state
    generateSubtitle() {
        const state = GameState.current;
        const subtitles = [
            'World watches with growing concern',
            'Experts divided on implications',
            'Government response inadequate, critics say',
            'Public demands answers',
            'Industry leaders call for regulation',
            'Scientists warn of unintended consequences'
        ];
        
        return subtitles[Math.floor(Math.random() * subtitles.length)];
    },
    
    // Generate side article for newspaper
    generateSideArticle(type) {
        const state = GameState.current;
        
        if (type === 'tech') {
            if (state.flags.hasAIResearchers) {
                return {
                    title: 'AI Designs Its Own Successors',
                    content: 'Recursive self-improvement accelerates development timeline.'
                };
            } else if (state.resources.compute > 70) {
                return {
                    title: 'Compute Power Rivals Nations',
                    content: 'Private companies control unprecedented processing capability.'
                };
            } else {
                return {
                    title: 'Algorithm Efficiency Improves',
                    content: 'New techniques reduce computational requirements significantly.'
                };
            }
        } else {
            if (state.resources.talent < 40) {
                return {
                    title: 'Tech Workers Feel Obsolete',
                    content: 'AI automation displaces even highly skilled programmers.'
                };
            } else if (state.resources.energy > 70) {
                return {
                    title: 'Energy Crisis Looms',
                    content: 'AI training consumes power equivalent to small countries.'
                };
            } else {
                return {
                    title: 'Society Adapts to AI Era',
                    content: 'Educational systems overhaul curriculum for automated future.'
                };
            }
        }
    },
    
    // End game
    endGame(ending) {
        // console.log('Game.endGame called with:', ending);
        
        // Defensive check
        if (!ending || typeof ending !== 'string') {
            // console.error('Invalid ending passed to endGame:', ending);
            ending = 'unknown_ending';
        }
        
        // Update legacy based on ending
        const legacyMap = {
            aligned_agi: 'savior',
            rogue_ai: 'destroyer',
            bankruptcy: 'sellout',
            no_trust: 'destroyer',
            competitor_wins: 'cautious',
            uncertain_agi: 'balanced',
            superintelligence: 'singular_legend'
        };
        
        if (legacyMap[ending]) {
            GameState.updateLegacy(legacyMap[ending]);
        }
        
        // Store last ending for variety system
        try {
            localStorage.setItem('ai2027_lastEnding', ending);
        } catch (e) {
            // Ignore localStorage errors
        }
        
        // Show game over screen
        UI.showGameOver(ending);
        
        // Clear saved game
        // No save system
    },
    
    // Restart game
    restart() {
        GameState.reset();
        // No save system
        Cards.usedCards.clear();
        Cards.cardQueue = [];
        
        // Reload page for clean restart
        window.location.reload();
    }
};