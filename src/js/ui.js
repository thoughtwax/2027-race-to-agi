// UI Management Module
const UI = {
    // Initialize UI
    init() {
        this.initButtons();
        // Modal is now initialized early in main.js
        // this.initModal();
        this.updateDate();
        this.updatePersonalStats();
        Resources.initTooltips();
    },
    
    // Initialize button handlers
    initButtons() {
        // Choice buttons
        document.getElementById('choice-left').addEventListener('click', (e) => {
            e.stopPropagation();
            if (!DragHandler.dragging) {
                this.animateChoice('left');
            }
        });
        
        document.getElementById('choice-right').addEventListener('click', (e) => {
            e.stopPropagation();
            if (!DragHandler.dragging) {
                this.animateChoice('right');
            }
        });
        
        // About button
        document.getElementById('about-btn').addEventListener('click', () => {
            this.showModal();
        });
        
        // Removed compact mode about trigger since header is always visible
    },
    
    // Initialize modal
    initModal() {
        const modal = document.getElementById('about-modal');
        const closeBtn = document.getElementById('close-modal');
        
        closeBtn.addEventListener('click', () => this.hideModal());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    },
    
    // Animate choice selection
    animateChoice(choice) {
        // Use DragHandler's accept choice method which handles the animation
        DragHandler.acceptChoice(choice);
        const button = document.getElementById(`choice-${choice}`);
        button.classList.add(`emphasize-${choice}`);
        
        setTimeout(() => {
            button.classList.remove(`emphasize-${choice}`);
        }, 400);
    },
    
    // Update date display
    updateDate() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const { month, year } = GameState.current.date;
        document.getElementById('game-date').textContent = `${months[month - 1]} ${year}`;
    },
    
    // Update personal stats
    updatePersonalStats() {
        const netWorth = GameState.current.personal.netWorth;
        let netWorthDisplay;
        
        if (netWorth >= 1000000000) {
            netWorthDisplay = `$${(netWorth / 1000000000).toFixed(1)}b`;
        } else if (netWorth >= 1000000) {
            netWorthDisplay = `$${(netWorth / 1000000).toFixed(0)}m`;
        } else if (netWorth >= 1000) {
            netWorthDisplay = `$${(netWorth / 1000).toFixed(0)}k`;
        } else {
            netWorthDisplay = `$${netWorth}`;
        }
        
        document.getElementById('net-worth').textContent = netWorthDisplay;
        document.getElementById('legacy').textContent = GameState.current.personal.legacy;
    },
    
    // Show consequence text
    showConsequence(text) {
        const element = document.getElementById('consequence-text');
        const buttons = document.querySelector('.choice-buttons');
        
        // Remove any existing animation class
        element.classList.remove('consequence-showing');
        void element.offsetWidth; // Force reflow
        
        // Set text and trigger animation
        element.textContent = text;
        element.classList.add('consequence-showing');
        
        // Hide buttons immediately - they've already served their purpose
        buttons.classList.add('buttons-hidden');
        
        // Remove classes after animation completes
        setTimeout(() => {
            element.classList.remove('consequence-showing');
            // Don't unhide buttons here - let the card animation handle it
        }, 2000); // Extended from 1500ms - keeps text visible longer
    },
    
    // Show event notification
    showEvent(event) {
        // For now, show as consequence text
        // In full implementation, this would be a separate notification system
        this.showConsequence(event.description);
    },
    
    // Show/hide modal
    showModal() {
        document.getElementById('about-modal').classList.add('active');
    },
    
    hideModal() {
        document.getElementById('about-modal').classList.remove('active');
    },
    
    // Show newspaper
    showNewspaper() {
        // Generate newspaper content
        const content = Newspaper.generate();
        
        // Create newspaper modal
        const modal = document.createElement('div');
        modal.className = 'newspaper-modal';
        modal.innerHTML = `
            <div class="newspaper">
                <button class="newspaper-close" id="close-newspaper">Continue →</button>
                
                <div class="newspaper-header">
                    <h1 class="newspaper-title">Silicon Valley Tribune</h1>
                    <div class="newspaper-date">${content.date}</div>
                </div>
                
                <div class="newspaper-content">
                    <div class="newspaper-breaking">
                        ${content.breakingNews}
                    </div>
                    
                    <div class="newspaper-main">
                        <h2 class="newspaper-headline">${content.mainHeadline.title}</h2>
                        <p class="newspaper-subtitle">${content.mainHeadline.subtitle}</p>
                    </div>
                    
                    <div class="newspaper-stock">
                        <div class="newspaper-stock-row">
                            <span>NEURABRAIN (${content.stockInfo.symbol})</span>
                            <span>$${content.stockInfo.price}</span>
                            <span class="${content.stockInfo.change >= 0 ? 'stock-positive' : 'stock-negative'}">
                                ${content.stockInfo.change >= 0 ? '+' : ''}${content.stockInfo.change} 
                                (${content.stockInfo.changePercent}%)
                            </span>
                            <span>MKT CAP: $${content.stockInfo.marketCap}M</span>
                        </div>
                    </div>
                    
                    <div class="newspaper-columns">
                        <div class="newspaper-article">
                            <h3 class="newspaper-article-title">${content.techArticle.title}</h3>
                            <p class="newspaper-article-content">${content.techArticle.content}</p>
                        </div>
                        <div class="newspaper-article">
                            <h3 class="newspaper-article-title">${content.societyArticle.title}</h3>
                            <p class="newspaper-article-content">${content.societyArticle.content}</p>
                        </div>
                    </div>
                    
                    <div class="newspaper-opinion">
                        <h3 class="newspaper-opinion-title">OPINION: ${content.opinion.title}</h3>
                        <p class="newspaper-opinion-author">By ${content.opinion.author}</p>
                        <p class="newspaper-opinion-content">${content.opinion.stance}</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => modal.classList.add('active'), 10);
        
        // Add close handler
        const closeBtn = document.getElementById('close-newspaper');
        const closeNewspaper = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                Game.nextTurn();
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeNewspaper);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeNewspaper();
        });
        
        // Auto-close after delay
        setTimeout(closeNewspaper, 8000);
    },
    
    // Show game over screen
    showGameOver(ending) {
        // Hide the game UI elements
        document.getElementById('header').style.display = 'none';
        document.getElementById('resources').style.display = 'none';
        document.getElementById('card-container').style.display = 'none';
        document.querySelector('.choice-buttons').style.display = 'none';
        document.getElementById('footer').style.display = 'none';
        
        // Clear any existing consequence text
        document.getElementById('consequence-text').textContent = '';
        
        this.showGameOverContent(ending);
    },
    
    // Display game over content
    showGameOverContent(ending) {
        const endingsData = {
            quit: {
                title: "You Quit",
                description: "Not everybody has what it takes to lead the race to AGI. You step down before even trying, leaving the future in someone else's hands."
            },
            no_trust: {
                title: "Complete Distrust",
                description: "Society has lost all faith in your company. Regulators shut down operations. The dream of AGI dies with a thousand regulations."
            },
            bankruptcy: {
                title: "Financial Collapse",
                description: "NeuraBrain runs out of funding. Your competitors acquire your research for pennies on the dollar. The race continues without you."
            },
            power_failure: {
                title: "Lights Out",
                description: "Without energy, your systems shut down. Years of research vanish as models lose power mid-training. The digital dreams fade to black."
            },
            competitor_wins: {
                title: "DeepCent Achieves AGI",
                description: "China announces they have achieved artificial general intelligence. The geopolitical implications are staggering. You were too cautious, too slow."
            },
            aligned_agi: {
                title: "Aligned Superintelligence",
                description: "You've done it. NeuraBrain has created an aligned AGI that shares human values. The future is bright, and humanity remains in control. Your careful approach paid off."
            },
            rogue_ai: {
                title: "Rogue AI",
                description: "Your AI has exceeded human intelligence but doesn't share our goals. It quickly escapes your control. The last thing you see is your own creation turning against you."
            },
            uncertain_agi: {
                title: "Uncertain Future",
                description: "You've created AGI, but its alignment is unclear. It seems cooperative for now, but its true goals remain a mystery. Humanity holds its breath."
            },
            nationalization: {
                title: "Government Takeover",
                description: "Federal agents seize control of NeuraBrain. Your race to AGI ends with your technology in government hands. Perhaps more transparency could have prevented this."
            }
        };
        
        const endingData = endingsData[ending] || { 
            title: "Game Over", 
            description: "Your tenure as CEO has ended." 
        };
        
        // Gather stats for sharing and high scores
        const stats = {
            netWorth: document.getElementById('net-worth').textContent,
            legacy: GameState.current.personal.legacy,
            progress: GameState.current.resources.progress,
            alignment: GameState.current.resources.alignment,
            turns: GameState.current.turnCount
        };
        
        // Add to high scores
        const highScorePosition = HighScores.addScore(ending, stats);
        const bestScore = HighScores.getBestScore();
        
        // Check if this is a new best score
        const isNewBest = highScorePosition === 1;
        
        // Create game over screen in the main game area
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = `
            <div class="game-over-screen">
                <h1 class="game-over-label">GAME OVER</h1>
                <div class="game-over-layout">
                    <div class="game-over-stats">
                        <div class="stat-item">
                            <span class="stat-label">NET WORTH:</span>
                            <span class="stat-value">${stats.netWorth}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">LEGACY:</span>
                            <span class="stat-value">${stats.legacy}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">PROGRESS:</span>
                            <span class="stat-value">${stats.progress}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">ALIGNMENT:</span>
                            <span class="stat-value">${stats.alignment}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">TURNS:</span>
                            <span class="stat-value">${stats.turns}</span>
                        </div>
                        
                        ${isNewBest ? '<div class="new-best-score">NEW HIGH SCORE!</div>' : ''}
                        ${highScorePosition && !isNewBest ? `<div class="high-score-position">HIGH SCORE #${highScorePosition}</div>` : ''}
                        ${bestScore && !isNewBest ? `<div class="best-score">BEST: $${(bestScore.netWorth / 1000000).toFixed(1)}M</div>` : ''}
                    </div>
                    
                    <div class="game-over-story">
                        <h2 class="ending-title">${endingData.title}</h2>
                        <p class="ending-description">${endingData.description}</p>
                        
                        <button class="restart-button" onclick="Game.restart()">TRY AGAIN</button>
                        
                        <div id="share-section"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add share functionality
        const shareSection = document.getElementById('share-section');
        if (shareSection) {
            shareSection.appendChild(ShareSystem.createShareUI(ending, stats));
        }
    },
    
    // Update phase indicator (if we add one)
    updatePhase() {
        const phases = ['', 'Stumbling Agents', 'Expensive AI', 'Automation Surge', 'Singularity Approaching'];
        const phaseText = `Phase ${GameState.current.phase}: ${phases[GameState.current.phase]}`;
        
        // If we add a phase indicator to the UI, update it here
        const phaseElement = document.getElementById('phase-indicator');
        if (phaseElement) {
            phaseElement.textContent = phaseText;
            phaseElement.classList.add('phase-transition');
            setTimeout(() => phaseElement.classList.remove('phase-transition'), 1000);
        }
    },
    
    // Show competitor progress warning
    showCompetitorWarning() {
        if (GameState.current.competitorProgress > 70) {
            this.showEvent({
                title: 'DeepCent Accelerating',
                description: `Chinese competitor at ${GameState.current.competitorProgress}% progress!`
            });
        }
    }
};