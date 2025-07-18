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
                            <span>OPENBRAIN (${content.stockInfo.symbol})</span>
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
        
        // Click anywhere on the modal or newspaper to close
        modal.addEventListener('click', closeNewspaper);
        
        // Prevent event bubbling from child elements if needed
        const newspaper = modal.querySelector('.newspaper');
        newspaper.addEventListener('click', closeNewspaper);
        
        // Auto-close after delay
        setTimeout(closeNewspaper, 8000);
    },
    
    // Show game over screen
    showGameOver(ending) {
        // console.log('Game Over - Ending triggered:', ending);
        
        // Defensive check for null/undefined
        if (!ending) {
            // console.error('ERROR: showGameOver called with null/undefined ending!');
            ending = 'unknown_ending';
        }
        
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
        // Comprehensive logging (commented out for production)
        // console.log('=== GAME OVER DEBUG ===');
        // console.log('Ending parameter:', ending);
        // console.log('Ending type:', typeof ending);
        // console.log('Game state at ending:', {
        //     resources: GameState.current.resources,
        //     turn: GameState.current.turnCount,
        //     phase: GameState.current.phase
        // });
        
        // First try to get ending from Config if available
        let endingData = null;
        if (typeof Config !== 'undefined' && Config.endings && Config.endings[ending]) {
            endingData = Config.endings[ending];
            // console.log('Found ending in Config');
        }
        
        // Fallback to hardcoded endings
        const endingsData = {
            quit: {
                title: "You Quit",
                description: "**Not everybody has what it takes** to lead the race to AGI. You step down before even trying, leaving the future in someone else's hands."
            },
            no_trust: {
                title: "Complete Distrust",
                description: "**Society has lost all faith** in you and your company. Regulators shut down operations. The dream of AGI dies with a thousand regulations."
            },
            bankruptcy: {
                title: "Financial Collapse",
                description: "**OpenBrain runs out of funding**. Your competitors acquire your research for pennies on the dollar. The race continues without you."
            },
            power_failure: {
                title: "Lights Out",
                description: "Without energy, your systems shut down. Years of research vanish as models lose power mid-training. The digital dreams fade to black."
            },
            competitor_wins: {
                title: "DeepCent Achieves AGI",
                description: "**China announces they have achieved AGI**. The geopolitical implications are staggering. You were too cautious, too slow."
            },
            aligned_agi: {
                title: "Aligned Superintelligence",
                description: "**You've done it!** OpenBrain has created an aligned AGI that shares human values. The future is bright, and humanity remains in control. Your careful approach paid off."
            },
            rogue_ai: {
                title: "Rogue AI",
                description: "**Disaster.** Your AI has exceeded human intelligence but doesn't share our goals. It quickly escapes your control. The last thing you see is your own creation turning against you."
            },
            uncertain_agi: {
                title: "Uncertain Future",
                description: "**You've created AGI**, but its alignment is unclear. It seems cooperative for now, but its true goals remain a mystery. Humanity holds its breath."
            },
            nationalization: {
                title: "Government Takeover",
                description: "**Federal agents seize control** of OpenBrain. Your race to AGI ends with your technology in government hands. Perhaps more transparency could have prevented this."
            },
            superintelligence: {
                title: "Technological Singularity",
                description: "**You've created something beyond AGI**—a superintelligence that rapidly improves itself. In moments, it surpasses all human understanding. Whether this marks humanity's transcendence or obsolescence remains to be seen."
            },
            unknown_ending: {
                title: "Unexpected Outcome",
                description: "**Something went wrong**. The simulation has ended in an unexpected way. Please check the console for debugging information."
            }
        };
        
        // Use config data if available, otherwise fallback to hardcoded
        if (!endingData) {
            endingData = endingsData[ending];
            if (endingData) {
                // console.log('Found ending in hardcoded data');
            }
        }
        
        // Final fallback for unknown endings
        if (!endingData) {
            // console.error(`UNKNOWN ENDING: "${ending}"`);
            // console.error('Available endings:', Object.keys(endingsData));
            // console.error('This is causing the generic game over screen!');
            
            endingData = { 
                title: "Game Over", 
                description: "Your journey to create AGI has come to an end. The future remains uncertain." 
            };
        }
        
        // console.log('Final ending data:', endingData);
        // console.log('=== END DEBUG ===');
        
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
        
        // Check if this is a new best score
        const isNewBest = highScorePosition === 1;
        
        // Create game over screen in the main game area
        const gameArea = document.getElementById('game-area');
        
        // Reset game-area styles to prevent flex centering issues
        gameArea.style.display = 'block';
        gameArea.style.justifyContent = 'initial';
        gameArea.style.alignItems = 'initial';
        
        gameArea.innerHTML = `
            <div class="game-over-screen" data-ending="${ending}">
                <video class="game-over-video" autoplay loop muted playsinline>
                    <source src="assets/images/${ending === 'aligned_agi' ? 'win' : 'gameover'}.mp4" type="video/mp4">
                </video>
                <div class="game-over-container">
                    <h1 class="game-over-label">${ending === 'aligned_agi' ? 'SUCCESS!' : 'GAME OVER'}</h1>
                    
                    <div class="ending-card" data-ending="${ending}">
                        <div class="card-label">YOUR RESULT</div>
                        <h2 class="ending-title">${endingData.title}</h2>
                        <div class="ending-description">${this.formatText(endingData.description)}</div>
                    </div>
                    
                    <div class="game-over-story">
                        <button class="restart-button" onclick="Game.restart()">TRY AGAIN</button>
                    </div>
                    
                    <div class="ticker-container">
                        <div class="ticker-content">
                            <span class="ticker-item">
                                <span class="stat-label">NET WORTH:</span>
                                <span class="stat-value">${stats.netWorth}</span>
                            </span>
                            <span class="ticker-item">
                                <span class="stat-label">LEGACY:</span>
                                <span class="stat-value">${stats.legacy}</span>
                            </span>
                            <span class="ticker-item">
                                <span class="stat-label">PROGRESS:</span>
                                <span class="stat-value">${stats.progress}%</span>
                            </span>
                            <span class="ticker-item">
                                <span class="stat-label">ALIGNMENT:</span>
                                <span class="stat-value">${stats.alignment}%</span>
                            </span>
                            <span class="ticker-item">
                                <span class="stat-label">TURNS:</span>
                                <span class="stat-value">${stats.turns}</span>
                            </span>
                            ${isNewBest ? '<span class="ticker-item new-best-score">NEW HIGH SCORE!</span>' : ''}
                            ${highScorePosition && !isNewBest ? `<span class="ticker-item high-score-position">HIGH SCORE #${highScorePosition}</span>` : ''}
                            <span class="ticker-item">
                                <span class="stat-label">NET WORTH:</span>
                                <span class="stat-value">${stats.netWorth}</span>
                            </span>
                            <span class="ticker-item">
                                <span class="stat-label">LEGACY:</span>
                                <span class="stat-value">${stats.legacy}</span>
                            </span>
                            <span class="ticker-item">
                                <span class="stat-label">PROGRESS:</span>
                                <span class="stat-value">${stats.progress}%</span>
                            </span>
                            <span class="ticker-item">
                                <span class="stat-label">ALIGNMENT:</span>
                                <span class="stat-value">${stats.alignment}%</span>
                            </span>
                            <span class="ticker-item">
                                <span class="stat-label">TURNS:</span>
                                <span class="stat-value">${stats.turns}</span>
                            </span>
                            ${isNewBest ? '<span class="ticker-item new-best-score">NEW HIGH SCORE!</span>' : ''}
                            ${highScorePosition && !isNewBest ? `<span class="ticker-item high-score-position">HIGH SCORE #${highScorePosition}</span>` : ''}
                        </div>
                    </div>
                    
                    <!-- <div id="share-section" class="share-section"></div> -->
                </div>
            </div>
        `;
        
        // Remove the scroll manipulation - let the natural layout work
        // The CSS padding should handle the spacing
        
        // Add share functionality - commented out for now
        // const shareSection = document.getElementById('share-section');
        // if (shareSection) {
        //     shareSection.appendChild(ShareSystem.createShareUI(ending, stats));
        // }
    },
    
    // Update phase indicator (if we add one)
    // Format text with line breaks and bold
    formatText(text) {
        // First process line breaks
        const lines = text.split('\n');
        const formattedLines = lines.map(line => {
            // Process bold text marked with **text**
            return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        });
        return formattedLines.join('<br>');
    },
    
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