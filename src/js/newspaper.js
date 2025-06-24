// Newspaper System
const Newspaper = {
    // Generate dynamic newspaper content
    generate() {
        const state = GameState.current;
        const r = state.resources;
        
        // Get main headline
        const mainHeadline = this.getMainHeadline();
        
        // Get side articles
        const techArticle = this.getTechArticle();
        const societyArticle = this.getSocietyArticle();
        
        // Get opinion piece
        const opinion = this.getOpinionPiece();
        
        // Get stock ticker
        const stockInfo = this.getStockTicker();
        
        return {
            date: this.formatDate(),
            mainHeadline,
            techArticle,
            societyArticle,
            opinion,
            stockInfo,
            breakingNews: this.getBreakingNews()
        };
    },
    
    // Format newspaper date
    formatDate() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        const { month, year } = GameState.current.date;
        return `${months[month - 1]} ${year}`;
    },
    
    // Get main headline based on game state
    getMainHeadline() {
        const state = GameState.current;
        const r = state.resources;
        const headlines = [];
        
        // Phase-specific headlines
        if (state.phase === 4) {
            headlines.push(
                { title: "FINAL COUNTDOWN TO AGI", subtitle: "Humanity stands at the precipice of a new era" },
                { title: "THE LAST DAYS OF HOMO SAPIENS?", subtitle: "Scientists debate post-human future" },
                { title: "SINGULARITY IMMINENT", subtitle: "World braces for intelligence explosion" }
            );
        }
        
        // Crisis headlines
        if (r.trust < 20) {
            headlines.push(
                { title: "NEURABRAIN UNDER SIEGE", subtitle: "Protesters demand immediate shutdown" },
                { title: "AI LAB FACES CRIMINAL CHARGES", subtitle: "Prosecutors cite 'reckless endangerment of humanity'" },
                { title: "TRUST IN AI HITS ROCK BOTTOM", subtitle: "Poll shows 90% oppose continued development" }
            );
        }
        
        if (r.energy > 80) {
            headlines.push(
                { title: "ENERGY GRID NEAR COLLAPSE", subtitle: "AI training consumes 15% of national power" },
                { title: "CLIMATE EMERGENCY DECLARED", subtitle: "UN links AI energy use to accelerating warming" },
                { title: "BLACKOUTS SPREAD NATIONWIDE", subtitle: "Citizens pay price for AI ambitions" }
            );
        }
        
        if (r.progress > 80) {
            headlines.push(
                { title: "AI SURPASSES HUMAN SCIENTISTS", subtitle: "NeuraBrain system designs its own successor" },
                { title: "THE INTELLIGENCE EXPLOSION BEGINS", subtitle: "Recursive self-improvement detected" },
                { title: "POINT OF NO RETURN PASSED", subtitle: "AGI development now unstoppable, experts warn" }
            );
        }
        
        if (r.alignment < 30 && state.flags.alignmentRevealed) {
            headlines.push(
                { title: "AI ALIGNMENT FAILURE CONFIRMED", subtitle: "Leaked documents reveal loss of control" },
                { title: "ROGUE AI FEARS MOUNT", subtitle: "Safety researchers abandon NeuraBrain en masse" },
                { title: "HUMANITY'S GREATEST MISTAKE?", subtitle: "Critics say misaligned AGI threatens extinction" }
            );
        }
        
        if (state.competitorProgress > 70) {
            headlines.push(
                { title: "CHINA CLAIMS AGI BREAKTHROUGH", subtitle: "DeepCent announces 'superhuman' AI system" },
                { title: "AMERICA LOSES AI SUPREMACY", subtitle: "Geopolitical balance shifts overnight" },
                { title: "THE RACE IS LOST", subtitle: "US falls behind in AGI development" }
            );
        }
        
        // Default headlines by phase
        if (headlines.length === 0) {
            const phaseHeadlines = [
                [],
                [
                    { title: "AI GOLD RUSH INTENSIFIES", subtitle: "Billions pour into machine learning research" },
                    { title: "THE GREAT ACCELERATION", subtitle: "AI capabilities double every six months" }
                ],
                [
                    { title: "EXPENSIVE AI ERA DAWNS", subtitle: "Training costs rival space programs" },
                    { title: "COMPUTE ARMS RACE ESCALATES", subtitle: "Nations compete for processing power" }
                ],
                [
                    { title: "AUTOMATION TRANSFORMS SOCIETY", subtitle: "Millions displaced as AI takes over" },
                    { title: "THE JOBLESS FUTURE", subtitle: "Economic disruption accelerates" }
                ],
                [
                    { title: "HUMANITY AT CROSSROADS", subtitle: "AGI promises utopia or extinction" },
                    { title: "THE FINAL INVENTION", subtitle: "Will artificial intelligence be our last?" }
                ]
            ];
            
            headlines.push(...(phaseHeadlines[state.phase] || phaseHeadlines[1]));
        }
        
        return headlines[Math.floor(Math.random() * headlines.length)] || 
               { title: "AI DEVELOPMENT CONTINUES", subtitle: "Progress steady despite challenges" };
    },
    
    // Get technology article
    getTechArticle() {
        const state = GameState.current;
        const articles = [];
        
        if (state.flags.hasAIResearchers) {
            articles.push({
                title: "AI Designs Better AI",
                content: "Recursive improvement loop creates exponential progress curve."
            });
        }
        
        if (state.resources.compute > 70) {
            articles.push({
                title: "Compute Clusters Rival Supercomputers",
                content: "Private companies now control unprecedented processing power."
            });
        }
        
        if (state.resources.knowledge > 60) {
            articles.push({
                title: "Algorithm Efficiency Breakthrough",
                content: "New techniques reduce training time by order of magnitude."
            });
        }
        
        if (state.multipliers.knowledge > 1) {
            articles.push({
                title: "Knowledge Compounds Exponentially",
                content: "AI-assisted research accelerates scientific discovery."
            });
        }
        
        // Default articles
        articles.push(
            {
                title: "Neural Networks Show Promise",
                content: "Latest architectures demonstrate unprecedented capabilities."
            },
            {
                title: "Hardware Innovation Continues",
                content: "Custom AI chips push boundaries of computation."
            }
        );
        
        return articles[Math.floor(Math.random() * articles.length)];
    },
    
    // Get society article
    getSocietyArticle() {
        const state = GameState.current;
        const r = state.resources;
        const articles = [];
        
        if (r.talent < 40) {
            articles.push({
                title: "Tech Workers Feel Obsolete",
                content: "Even programmers replaced by AI systems."
            });
        }
        
        if (r.trust < 40) {
            articles.push({
                title: "Public Confidence Erodes",
                content: "Survey shows growing fear of AI development."
            });
        }
        
        if (state.flags.climateProtests) {
            articles.push({
                title: "Environmental Groups Mobilize",
                content: "Massive protests target AI energy consumption."
            });
        }
        
        if (state.phase >= 3) {
            articles.push({
                title: "Unemployment Soars",
                content: "Automation displaces millions of workers."
            });
        }
        
        // Default articles
        articles.push(
            {
                title: "Society Adapts to AI",
                content: "Educational systems overhaul for automated future."
            },
            {
                title: "Income Inequality Widens",
                content: "AI benefits concentrate among elite few."
            }
        );
        
        return articles[Math.floor(Math.random() * articles.length)];
    },
    
    // Get opinion piece
    getOpinionPiece() {
        const opinions = [
            {
                author: "Dr. Sarah Chen",
                title: "We Must Slow Down",
                stance: "The race to AGI risks everything we hold dear."
            },
            {
                author: "Tech Mogul Rex Harrison",
                title: "Full Speed Ahead",
                stance: "Pausing AI development hands victory to our rivals."
            },
            {
                author: "Prof. James Wright",
                title: "The Alignment Problem",
                stance: "Without solving alignment, AGI means human extinction."
            },
            {
                author: "Sen. Maria Rodriguez",
                title: "Regulate Before Too Late",
                stance: "Government must act now to control AI development."
            },
            {
                author: "Futurist Alex Kim",
                title: "Embrace the Singularity",
                stance: "AGI will solve all humanity's problems - if we let it."
            }
        ];
        
        return opinions[Math.floor(Math.random() * opinions.length)];
    },
    
    // Get stock ticker info
    getStockTicker() {
        const r = GameState.current.resources;
        const netWorth = GameState.current.personal.netWorth;
        
        // Calculate stock price based on resources
        const basePrice = 100;
        const trustMultiplier = r.trust / 50;
        const progressMultiplier = 1 + (r.progress / 100);
        const capitalMultiplier = r.capital / 50;
        
        const stockPrice = Math.round(basePrice * trustMultiplier * progressMultiplier * capitalMultiplier);
        const change = Math.round((Math.random() - 0.5) * 20);
        
        return {
            symbol: "NRBR",
            price: stockPrice,
            change: change,
            changePercent: (change / stockPrice * 100).toFixed(1),
            marketCap: Math.round(stockPrice * 50000000 / 1000000) // in millions
        };
    },
    
    // Get breaking news ticker
    getBreakingNews() {
        const news = [
            "BREAKING: EU considers emergency AI moratorium",
            "FLASH: Mysterious power outage at DeepCent facility",
            "UPDATE: UN Security Council to discuss AI threat",
            "ALERT: Anonymous claims to have NeuraBrain source code",
            "NEWS: Major tech company announces AGI timeline",
            "BREAKING: Scientists detect anomalous network activity",
            "URGENT: Military put on high alert over AI concerns"
        ];
        
        return news[Math.floor(Math.random() * news.length)];
    }
};