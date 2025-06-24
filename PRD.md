# AI CEO 2027 - Product Requirements Document

## Executive Summary

AI CEO 2027 is a satirical web-based engine-building decision game where players assume the role of a CEO racing to develop Artificial General Intelligence (AGI). The game combines swipe-based decision mechanics with resource management and feedback loops, inspired by the AI2027 research paper's scenarios.

## Product Overview

### Vision
Create an engaging, educational game that illustrates the complex trade-offs and exponential dynamics involved in AGI development through accessible gameplay mechanics. The artistic goal is to get the player to consider the complex decision space and inherent dangers we face in developing AGI.

### Target Audience
- Tech enthusiasts interested in AI development
- Strategy game players who enjoy resource management
- Educators and students studying AI ethics and safety
- General audience curious about AGI implications

### Platform
- Web-based (HTML5)
- Mobile-first design with desktop compatibility
- No installation required

## Core Mechanics

### 1. Resource System (4x4 Engine)

#### Inputs (Consumed Resources)
1. **Compute** (🖥️) - Processing power for training AI models
2. **Energy** (⚡) - Power consumption for operations
3. **Talent** (🧠) - Human researchers and engineers
4. **Knowledge** (📊) - Algorithms, data, and research breakthroughs

#### Outputs (Generated Resources)
1. **Progress** (🚀) - Advancement toward AGI
2. **Trust** (🏛️) - Public and government confidence
3. **Capital** (💰) - Financial resources
4. **Alignment** (🎯) - AI safety and human value alignment

### 2. Decision Mechanics

- **Swipe Interface**: Players swipe left or right (or click buttons) to make binary choices
- **Card-Based Events**: Each decision presented as a card with context, choices, and consequences
- **Immediate Feedback**: Resource changes shown with floating indicators
- **Delayed Consequences**: Some decisions have effects that manifest later

### 3. Feedback Loops

#### Primary Loops
1. **Research Loop**: (Compute + Talent) × Energy% → Progress
2. **Knowledge Multiplier**: Progress > 30 → Knowledge generation
3. **Automation Loop**: AI researchers multiply knowledge generation by 2x
4. **Capital Generation**: (Trust × Progress) / 200 → Capital per turn
5. **Energy Efficiency**: High Knowledge reduces Energy consumption

#### Dangerous Loops
1. **Trust Decay**: High Energy use → Climate protests → Trust loss
2. **Alignment Decay**: Rapid Progress without safety → Alignment deteriorates
3. **Deception Risk**: Low Alignment + High Progress → Hidden AI deception
4. **Competitive Pressure**: Delays → Competitor advances → Pressure to cut corners

### 4. Progression System

#### Timeline
- **Phase 1 (Early 2025)**: Stumbling Agents - Basic AI deployment
- **Phase 2 (Late 2025)**: Expensive AI - Infrastructure scaling
- **Phase 3 (2026)**: Automation Surge - AI accelerates research
- **Phase 4 (2027)**: Singularity Approaching - Final push to AGI

#### Narrative Events
- News interstitials every 8 decisions showing world reaction
- Phase transitions with major story beats
- Dynamic events based on resource states and flags

## Technical Requirements

### Frontend Technologies
- Pure HTML5/CSS3/JavaScript (no frameworks)
- JetBrains Mono font for technical aesthetic
- Responsive design (mobile-first)
- Touch and mouse input support

### Performance
- Instant load time (single HTML file)
- Smooth animations (60 FPS)
- Minimal battery usage
- Works offline after initial load

### Browser Support
- Chrome/Edge (latest 2 versions)
- Safari (latest 2 versions)
- Firefox (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Game Features

### Core Features
1. **Resource Management**: Balance 8 resources with complex interactions
2. **Decision Trees**: 40+ unique decision cards across 4 phases
3. **Multiple Endings**: 8 different endings based on player choices
4. **Newspaper System**: Periodic news updates reflecting player impact
5. **Visual Feedback**: Animations, particle effects, and state indicators

### Advanced Features
1. **Multiplier System**: Exponential growth through AI automation
2. **Hidden Mechanics**: Alignment revealed only in late game
3. **Competitive AI**: DeepCent progress creates time pressure
4. **Crisis Events**: Urgent decisions with immediate consequences

### Polish Features
1. **Loading Screen**: Sets tone and explains core concept
2. **Tutorial System**: Optional tutorial explains mechanics
3. **Technical UI**: Monospace font and terminal aesthetic
4. **Accessibility**: Clear contrast, readable fonts, keyboard navigation

## Victory & Loss Conditions

### Victory Conditions
1. **Aligned AGI**: Achieve AGI with Alignment ≥ 70
2. **Controlled AGI**: High Trust and Security when reaching AGI

### Loss Conditions
1. **No Trust**: Society rejects your company
2. **Bankruptcy**: Run out of Capital
3. **Power Failure**: Run out of Energy
4. **Competitor Victory**: DeepCent reaches AGI first
5. **Rogue AI**: AGI with Alignment < 30
6. **Nationalization**: Government takeover due to low Trust

## Content Guidelines

### Narrative Tone
- Serious but accessible
- Grounded in plausible scenarios
- Educational without being preachy
- Tension without sensationalism

### Decision Design
- Meaningful trade-offs (no obvious choices)
- Short-term vs long-term consequences
- Resource costs clearly communicated
- Thematic relevance to AI development

### Ethical Considerations
- No promotion of unsafe AI development
- Balanced perspective on AI risks/benefits
- Respect for diverse viewpoints
- Educational value prioritized

## Future Enhancements

### Potential Features
1. **Save System**: Continue games across sessions
2. **Achievements**: Track different strategies and outcomes
3. **Difficulty Modes**: Adjust resource generation rates
4. **Extended Content**: More decision cards and phases
5. **Multiplayer**: Compare outcomes with other players

### Platform Expansion
1. **Native Mobile Apps**: iOS and Android versions
2. **Steam Release**: Desktop version with achievements
3. **Educational Package**: Classroom discussion guides

## Success Metrics

### Player Engagement
- Average session length: 15-30 minutes
- Completion rate: >60%
- Replay rate: >40%

### Educational Impact
- Player understanding of AI development challenges
- Awareness of alignment importance
- Appreciation for complex trade-offs

### Technical Performance
- Load time: <3 seconds
- No crashes or game-breaking bugs
- Consistent 60 FPS on target devices

## Development Timeline

### Phase 1: Core Game (Complete)
- Basic resource system ✓
- Decision mechanics ✓
- Core feedback loops ✓
- Essential UI/UX ✓

### Phase 2: Polish (Complete)
- Visual effects ✓
- Newspaper system ✓
- Tutorial ✓
- Multiple endings ✓

### Phase 3: Future Updates
- Save system
- Additional content
- Platform ports
- Community features

## Team & Credits

### Design Inspiration
- Based on AI2027 paper by Kokotajlo, Lifland, Larsen, et al.
- Engine-building mechanics inspired by Wingspan
- Swipe mechanics inspired by Reigns
- Narrative structure inspired by SimCity 2000

### Development
- Single HTML file implementation
- No external dependencies
- Open source friendly

## Appendix

### Resource Formulas
```
Progress per turn = floor((Compute × 0.1 + Talent × 0.1) × (Energy / 100))
Knowledge per turn = floor(Progress × 0.1 × Knowledge_Multiplier) if Progress > 30
Capital per turn = floor((Trust × Progress) / 200)
Energy cost per turn = floor(Compute × 0.15 / Energy_Efficiency)
```

### Decision Impact Ranges
- Small: ±5-10 points
- Medium: ±15-25 points
- Large: ±30-40 points
- Critical: ±50+ points

### Multiplier Thresholds
- Knowledge Multiplier: 2x when AI Researchers enabled
- Energy Efficiency: 1 + (Knowledge - 50) × 0.01 when Knowledge > 50

---

This PRD serves as the definitive guide for AI CEO 2027's design, implementation, and future development.