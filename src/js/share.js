// Share System Module
const ShareSystem = {
    // Generate shareable results text
    generateShareText(ending, stats) {
        const endingEmojis = {
            aligned_agi: '🎯✨',
            rogue_ai: '🤖💀',
            bankruptcy: '💸😢',
            no_trust: '🚫😤',
            competitor_wins: '🇨🇳🏁',
            uncertain_agi: '🤷❓',
            nationalization: '🏛️⚖️',
            power_failure: '⚡💥'
        };
        
        const emoji = endingEmojis[ending] || '🎮';
        const winLose = ['aligned_agi'].includes(ending) ? 'Won' : 'Lost';
        
        return `I just ${winLose} RACE TO AGI! ${emoji}\n\n` +
               `💰 Net Worth: ${stats.netWorth}\n` +
               `🏆 Legacy: ${stats.legacy}\n` +
               `📈 Progress: ${stats.progress}%\n` +
               `🎯 Alignment: ${stats.alignment}%\n` +
               `🔄 Turns: ${stats.turns}\n\n` +
               `Can you build AGI without destroying humanity?\n` +
               `Play at: ${window.location.origin}${window.location.pathname}`;
    },
    
    // Share to Twitter
    shareToTwitter(text) {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=550,height=420');
    },
    
    // Share to LinkedIn
    shareToLinkedIn(text, url) {
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`;
        window.open(shareUrl, '_blank', 'width=550,height=420');
    },
    
    // Native Web Share API (mobile)
    async shareNative(text) {
        if (!navigator.share) {
            return false;
        }
        
        try {
            const shareData = {
                title: 'RACE TO AGI Results',
                text: text
            };
            
            await navigator.share(shareData);
            return true;
        } catch (err) {
            console.log('Share cancelled or failed:', err);
            return false;
        }
    },
    
    // Create share UI
    createShareUI(ending, stats) {
        const shareText = this.generateShareText(ending, stats);
        const gameUrl = window.location.origin + window.location.pathname;
        
        const shareContainer = document.createElement('div');
        shareContainer.className = 'share-container';
        shareContainer.innerHTML = `
            <h3>SHARE YOUR RESULTS</h3>
            <div class="share-links">
                <a href="#" id="share-twitter">Twitter</a>
                <a href="#" id="share-linkedin">LinkedIn</a>
                ${navigator.share ? `<a href="#" id="share-native">Share</a>` : ''}
            </div>
        `;
        
        // Set up link handlers after DOM is ready
        setTimeout(() => {
            document.getElementById('share-twitter')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.shareToTwitter(shareText);
            });
            
            document.getElementById('share-linkedin')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.shareToLinkedIn(shareText, gameUrl);
            });
            
            document.getElementById('share-native')?.addEventListener('click', async (e) => {
                e.preventDefault();
                const shared = await this.shareNative(shareText);
                if (!shared) {
                    // Fallback to Twitter if native share fails
                    this.shareToTwitter(shareText);
                }
            });
        }, 0);
        
        return shareContainer;
    }
};