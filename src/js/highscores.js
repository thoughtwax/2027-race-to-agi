// High Scores Module
const HighScores = {
    SCORES_KEY: 'ai2027_highscores',
    MAX_SCORES: 10,
    
    // Get all high scores
    getScores() {
        try {
            const saved = localStorage.getItem(this.SCORES_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load high scores:', e);
            return [];
        }
    },
    
    // Add a new score
    addScore(endingType, stats) {
        try {
            const scores = this.getScores();
            
            const newScore = {
                date: new Date().toISOString(),
                ending: endingType,
                netWorth: this.parseNetWorth(stats.netWorth),
                legacy: stats.legacy,
                progress: parseInt(stats.progress),
                alignment: parseInt(stats.alignment),
                turns: stats.turns,
                score: this.calculateScore(stats)
            };
            
            scores.push(newScore);
            
            // Sort by score descending
            scores.sort((a, b) => b.score - a.score);
            
            // Keep only top scores
            const topScores = scores.slice(0, this.MAX_SCORES);
            
            localStorage.setItem(this.SCORES_KEY, JSON.stringify(topScores));
            
            // Return position if in top scores, null otherwise
            const position = topScores.findIndex(s => 
                s.date === newScore.date && s.score === newScore.score
            );
            
            return position !== -1 ? position + 1 : null;
        } catch (e) {
            console.error('Failed to save high score:', e);
            return null;
        }
    },
    
    // Parse net worth string to number
    parseNetWorth(netWorthStr) {
        // Remove $ and parse
        const cleaned = netWorthStr.replace('$', '');
        
        if (cleaned.includes('b')) {
            return parseFloat(cleaned) * 1000000000;
        } else if (cleaned.includes('m')) {
            return parseFloat(cleaned) * 1000000;
        } else if (cleaned.includes('k')) {
            return parseFloat(cleaned) * 1000;
        } else {
            return parseFloat(cleaned);
        }
    },
    
    // Calculate score based on multiple factors
    calculateScore(stats) {
        const netWorth = this.parseNetWorth(stats.netWorth);
        const progress = parseInt(stats.progress);
        const alignment = parseInt(stats.alignment);
        const turns = stats.turns;
        
        // Score formula: net worth + progress * 1M + alignment * 500k + turns * 100k
        // This rewards wealth, progress, alignment, and survival
        return netWorth + 
               (progress * 1000000) + 
               (alignment * 500000) + 
               (turns * 100000);
    },
    
    // Get best score
    getBestScore() {
        const scores = this.getScores();
        return scores.length > 0 ? scores[0] : null;
    },
    
    // Clear all scores
    clearScores() {
        try {
            localStorage.removeItem(this.SCORES_KEY);
            return true;
        } catch (e) {
            console.error('Failed to clear high scores:', e);
            return false;
        }
    }
};